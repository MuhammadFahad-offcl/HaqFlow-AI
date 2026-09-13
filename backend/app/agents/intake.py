"""
Situation Intake Agent.

Extracts ONLY facts the user actually stated, as structured JSON. Never
decides eligibility, never fabricates a value for an unstated field (those
stay null and get listed in `missing_fields` instead).
"""
from __future__ import annotations

from app.agents.groq_client import groq_json
from app.models import IntakeResult

_SYSTEM_PROMPT = """You are HaqFlow's Situation Intake Agent.
Return ONLY valid JSON. Never decide official eligibility.
Extract only facts stated by the user. If a field is unknown, use null.
Identify missing fields needed for useful program matching.

Schema:
{
  "household_size": integer|null,
  "province": string|null,
  "district": string|null,
  "income_or_income_change": string|null,
  "life_shock": string|null,
  "children": [{"age": integer|null, "in_school": true|false|null}],
  "pregnancy_or_maternal_need": true|false|null,
  "disability": true|false|null,
  "employment_status": string|null,
  "documents_mentioned": [string],
  "missing_fields": [string],
  "next_question": string|null
}
"""


def run_intake_agent(text: str) -> IntakeResult:
    raw = groq_json(_SYSTEM_PROMPT, text)
    return IntakeResult.model_validate(raw)
