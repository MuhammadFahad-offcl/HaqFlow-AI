"""
Shared Pydantic schemas — the single source of truth for request/response
shapes exchanged between the FastAPI backend and the React frontend. Mirrors
`frontend/src/types/index.ts` (Api* types) field-for-field; if you change a
field here, update that file too.
"""
from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field

IntakeLanguage = Literal["en", "ur"]


# ---------------------------------------------------------------------------
# POST /api/v1/intake
# ---------------------------------------------------------------------------
class IntakeRequest(BaseModel):
    case_id: str
    message: str = Field(..., min_length=1, description="The user's free-text message this turn.")
    language: IntakeLanguage = "en"


class ChildFact(BaseModel):
    age: int | None = None
    in_school: bool | None = None


class IntakeResult(BaseModel):
    """Structured, non-hallucinating extraction. Unknown fields stay null — the
    agent must never guess a value the user did not state."""

    household_size: int | None = None
    province: str | None = None
    district: str | None = None
    income_or_income_change: str | None = None
    life_shock: str | None = None
    children: list[ChildFact] = Field(default_factory=list)
    pregnancy_or_maternal_need: bool | None = None
    disability: bool | None = None
    employment_status: str | None = None
    documents_mentioned: list[str] = Field(default_factory=list)
    missing_fields: list[str] = Field(default_factory=list)
    next_question: str | None = None


class IntakeResponse(BaseModel):
    case_id: str
    situation: IntakeResult


# ---------------------------------------------------------------------------
# POST /api/v1/match
# ---------------------------------------------------------------------------
class MatchRequest(BaseModel):
    case_id: str
    situation: dict[str, Any] = Field(
        ..., description="The Situation object accumulated so far (IntakeResult-shaped or richer)."
    )


class DeterministicCandidate(BaseModel):
    """Output of the pure-Python rules layer — no LLM involved. Always
    'appears_to_match'; final eligibility is never decided here."""

    program_id: str
    name: str
    match_status: Literal["appears_to_match"] = "appears_to_match"
    reasons: list[str]
    required_documents: list[str]
    verification_needed: Literal[True] = True
    official_source: str


class MatchExplanation(BaseModel):
    program_id: str
    why_it_appears_relevant: str
    missing_evidence: list[str] = Field(default_factory=list)
    verification: str
    next_steps: list[str] = Field(default_factory=list)


class MatchResponse(BaseModel):
    case_id: str
    summary: str
    matches: list[MatchExplanation]
    candidates: list[DeterministicCandidate]
    global_warning: str


# ---------------------------------------------------------------------------
# POST /api/v1/analyze-document
# ---------------------------------------------------------------------------
class ExtractedField(BaseModel):
    field: str
    value: str | None = None
    confidence: float = Field(ge=0.0, le=1.0)


class DocumentAnalysisResponse(BaseModel):
    document_type: str
    status: Literal["usable", "needs_review", "unreadable"]
    extracted_fields: list[ExtractedField] = Field(default_factory=list)
    missing_or_unclear: list[str] = Field(default_factory=list)
    overall_confidence: float = Field(ge=0.0, le=1.0)
    verification_note: str


# ---------------------------------------------------------------------------
# Error envelope (matches FastAPI's registered exception handlers)
# ---------------------------------------------------------------------------
class ErrorDetail(BaseModel):
    code: str
    message: str
    details: Any | None = None


class ErrorEnvelope(BaseModel):
    error: ErrorDetail
