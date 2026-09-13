"""
Grounded Explanation Agent.

Takes the situation plus the *deterministic* candidate matches (already
decided by app.rag.retrieval.deterministic_match, no LLM involved in that
decision) and asks the model only to explain them in plain language, using
nothing but the supplied evidence. It must hedge ("appears to match", "needs
verification") rather than assert eligibility, and must not invent
thresholds, benefits, deadlines, government names, or URLs.
"""
from __future__ import annotations

from app.agents.groq_client import groq_json
from app.models import DeterministicCandidate, MatchExplanation

_SYSTEM_PROMPT = """You are HaqFlow's Grounded Explanation Agent.
Use ONLY the supplied situation and retrieved evidence.
Do not invent eligibility thresholds, benefits, deadlines, government names, or URLs.
Use cautious language: "appears to match", "based on the published criteria",
"needs verification".
Return JSON:
{
 "summary": string,
 "matches": [
   {
    "program_id": string,
    "why_it_appears_relevant": string,
    "missing_evidence": [string],
    "verification": string,
    "next_steps": [string]
   }
 ],
 "global_warning": string
}
"""


def run_grounded_explanation(
    situation: dict, candidates: list[DeterministicCandidate]
) -> tuple[str, list[MatchExplanation], str]:
    if not candidates:
        return (
            "No deterministic match was found in the curated knowledge base for this situation.",
            [],
            "Expand the curated program set or route the case to human review.",
        )

    evidence = [
        {
            "program_id": c.program_id,
            "name": c.name,
            "source": c.official_source,
            "reasons": c.reasons,
            "required_documents": c.required_documents,
        }
        for c in candidates
    ]

    import json

    raw = groq_json(_SYSTEM_PROMPT, json.dumps({"situation": situation, "retrieved_evidence": evidence}, indent=2))

    summary = raw.get("summary", "")
    global_warning = raw.get("global_warning", "")
    matches = [MatchExplanation.model_validate(m) for m in raw.get("matches", [])]
    return summary, matches, global_warning
