"""
Document Agent.

Images are handed to the Groq multimodal model for structured field
extraction with a confidence score per field and overall. PDFs are
deliberately NOT parsed in this MVP (kept dependency-light, per the original
prototype and the architecture doc's "for the MVP, support PDF and image
uploads only ... keep it conservative" guidance) — they come back flagged
`needs_review` with an instruction to upload a rendered page/screenshot
instead. Low-confidence extraction is never treated as verified fact; that
policy is enforced again in main.py at the API boundary.
"""
from __future__ import annotations

import base64

from app.agents.groq_client import groq_json
from app.models import DocumentAnalysisResponse

_IMAGE_SYSTEM_PROMPT = """You are HaqFlow's Document Agent.
Interpret the uploaded document image only as evidence.
Never treat uncertain extraction as verified fact.
Return ONLY JSON:
{
 "document_type": string,
 "status": "usable"|"needs_review"|"unreadable",
 "extracted_fields": [{"field": string, "value": string|null, "confidence": number}],
 "missing_or_unclear": [string],
 "overall_confidence": number,
 "verification_note": string
}
Confidence must be between 0 and 1."""

_IMAGE_SUFFIXES = {"png", "jpg", "jpeg", "webp"}


def analyze_document_bytes(filename: str, data: bytes) -> DocumentAnalysisResponse:
    suffix = filename.lower().rsplit(".", 1)[-1] if "." in filename else ""

    if suffix in _IMAGE_SUFFIXES:
        image_b64 = base64.b64encode(data).decode("utf-8")
        raw = groq_json(
            _IMAGE_SYSTEM_PROMPT,
            "Analyze this uploaded document image. Extract only visible information.",
            image_b64=image_b64,
        )
        return DocumentAnalysisResponse.model_validate(raw)

    # PDFs (or anything else): conservative, no extraction attempted in the MVP.
    return DocumentAnalysisResponse(
        document_type="PDF" if suffix == "pdf" else (suffix.upper() or "UNKNOWN"),
        status="needs_review",
        extracted_fields=[],
        missing_or_unclear=[
            "PDF text/image extraction is intentionally conservative in this MVP.",
            "For evidence extraction, upload a clear image/screenshot of the relevant page.",
        ],
        overall_confidence=0.0,
        verification_note="Do not treat this file as verified evidence until fields are extracted and confirmed.",
    )
