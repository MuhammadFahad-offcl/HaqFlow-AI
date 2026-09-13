"""
HaqFlow Backend — FastAPI production server.

Exposes the three endpoints defined in the integration spec
(HaqFlow_Features_and_Tech_Stack.docx / the unification request):

    POST /api/v1/intake            -> Situation Intake Agent
    POST /api/v1/match              -> Retrieval + deterministic match + grounded explanation
    POST /api/v1/analyze-document   -> Document Agent (image/PDF evidence)

Design rules enforced here (see app/rag/retrieval.py, app/agents/*):
  - The LLM extracts and explains; it never decides eligibility.
  - Matching is deterministic Python first; the LLM only explains the result.
  - Low-confidence document extraction is surfaced, never silently upgraded
    to "verified".

Run directly:
    uvicorn app.main:app --reload
"""
from __future__ import annotations

import json
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, Form, HTTPException, UploadFile, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.agents.document import analyze_document_bytes
from app.agents.explanation import run_grounded_explanation
from app.agents.intake import run_intake_agent
from app.config import settings
from app.models import (
    DocumentAnalysisResponse,
    ErrorDetail,
    ErrorEnvelope,
    IntakeRequest,
    IntakeResponse,
    MatchRequest,
    MatchResponse,
)
from app.rag.retrieval import deterministic_match, retrieve_programs

logger = logging.getLogger("haqflow")

# 10 MB cap on uploaded evidence — generous for a phone photo of a document,
# small enough to avoid accidentally proxying huge files through to Groq.
MAX_UPLOAD_BYTES = 10 * 1024 * 1024
ALLOWED_UPLOAD_SUFFIXES = {"png", "jpg", "jpeg", "webp", "pdf"}


@asynccontextmanager
async def lifespan(_: FastAPI):
    if not settings.groq_api_key:
        logger.warning(
            "GROQ_API_KEY is not set. /api/v1/intake, /match, and /analyze-document "
            "will return 503 until it is configured (see .env.example)."
        )
    yield


app = FastAPI(
    title="HaqFlow Backend",
    version="1.0.0",
    description="Situation intake, program matching, and document evidence analysis for HaqFlow.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    # No cookies/session credentials are used by this API, so credentials
    # stay disabled — this is what makes a "*" wildcard origin (our default)
    # valid; browsers reject "*" combined with allow_credentials=True.
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _envelope(code: str, message: str, details: object | None = None) -> dict:
    return ErrorEnvelope(error=ErrorDetail(code=code, message=message, details=details)).model_dump()


@app.exception_handler(RequestValidationError)
async def _validation_error(_, exc: RequestValidationError):
    return JSONResponse(status_code=422, content=_envelope("validation_error", "Request validation failed.", exc.errors()))


@app.exception_handler(StarletteHTTPException)
async def _http_error(_, exc: StarletteHTTPException):
    return JSONResponse(status_code=exc.status_code, content=_envelope("http_error", str(exc.detail)))


@app.exception_handler(RuntimeError)
async def _runtime_error(_, exc: RuntimeError):
    # Mainly the "GROQ_API_KEY missing" case raised by settings.require_groq_key().
    return JSONResponse(status_code=503, content=_envelope("service_unavailable", str(exc)))


@app.exception_handler(Exception)
async def _unhandled(_, exc: Exception):
    logger.exception("Unhandled error")
    return JSONResponse(status_code=500, content=_envelope("internal_error", "An unexpected error occurred."))


@app.get("/health", tags=["meta"])
def health():
    return {"status": "ok", "service": "HaqFlow Backend", "version": "1.0.0", "env": settings.app_env}


@app.get("/", tags=["meta"])
def root():
    return {"service": "HaqFlow Backend", "docs": "/docs", "health": "/health"}


@app.get("/api/v1/diagnostics/groq", tags=["meta"])
def diagnostics_groq():
    """Fires one tiny, cheap Groq call to confirm the deployed API key and
    model name actually work end-to-end. Hit this URL directly in a browser
    right after deploying — it is the fastest way to tell "backend is up but
    Groq is misconfigured" apart from "backend itself is broken/unreachable".
    """
    if not settings.groq_api_key:
        return JSONResponse(
            status_code=503,
            content=_envelope(
                "groq_not_configured",
                "GROQ_API_KEY is not set on this deployment. Set it in your hosting "
                "provider's environment variables and redeploy.",
            ),
        )
    try:
        from app.agents.groq_client import groq_json

        result = groq_json(
            "Reply with ONLY this JSON object, nothing else: {\"ok\": true}",
            "ping",
        )
        return {
            "status": "ok",
            "groq_model": settings.groq_model,
            "groq_vision_model": settings.groq_vision_model,
            "sample_response": result,
        }
    except RuntimeError as exc:
        return JSONResponse(
            status_code=502,
            content=_envelope(
                "groq_call_failed",
                "The Groq API call failed. This almost always means an invalid "
                "API key or a decommissioned/misspelled model name.",
                str(exc),
            ),
        )


# ---------------------------------------------------------------------------
# POST /api/v1/intake
# ---------------------------------------------------------------------------
@app.post("/api/v1/intake", response_model=IntakeResponse, tags=["intake"])
def intake(payload: IntakeRequest) -> IntakeResponse:
    situation = run_intake_agent(payload.message)
    return IntakeResponse(case_id=payload.case_id, situation=situation)


# ---------------------------------------------------------------------------
# POST /api/v1/match
# ---------------------------------------------------------------------------
@app.post("/api/v1/match", response_model=MatchResponse, tags=["match"])
def match(payload: MatchRequest) -> MatchResponse:
    query = json.dumps(payload.situation)
    retrieved = retrieve_programs(query)
    candidates = deterministic_match(payload.situation, retrieved)
    summary, explanations, global_warning = run_grounded_explanation(payload.situation, candidates)

    return MatchResponse(
        case_id=payload.case_id,
        summary=summary,
        matches=explanations,
        candidates=candidates,
        global_warning=global_warning,
    )


# ---------------------------------------------------------------------------
# POST /api/v1/analyze-document
# ---------------------------------------------------------------------------
@app.post("/api/v1/analyze-document", response_model=DocumentAnalysisResponse, tags=["documents"])
async def analyze_document(
    file: UploadFile = File(...),
    case_id: str = Form(...),
) -> DocumentAnalysisResponse:
    suffix = file.filename.lower().rsplit(".", 1)[-1] if file.filename and "." in file.filename else ""
    if suffix not in ALLOWED_UPLOAD_SUFFIXES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type '.{suffix}'. Allowed: {sorted(ALLOWED_UPLOAD_SUFFIXES)}.",
        )

    data = await file.read()
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds the {MAX_UPLOAD_BYTES // (1024 * 1024)} MB upload limit.",
        )

    # Deliberately not logged: filename/bytes/case_id are never written to
    # application logs, per the "don't store unnecessary sensitive document
    # content in logs" rule in the architecture doc.
    result = analyze_document_bytes(file.filename or "upload", data)
    return result


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
