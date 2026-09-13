"""
Retrieval + deterministic matching.

Two separate, deliberately dumb-and-transparent stages, per the architecture
doc's rule that "scoring and eligibility should be deterministic where
possible" and "never let the LLM override a rule result":

1. retrieve_programs   -- simple lexical (token-overlap) retrieval over the
                            curated KB. Swap-in point for pgvector later.
2. deterministic_match -- pure Python, per-program keyword/field checks that
                            decide which retrieved candidates "appear to
                            match". No LLM call happens in this module.
"""
from __future__ import annotations

import re
from typing import Any

from app.models import DeterministicCandidate
from app.rag.programs import PROGRAMS, Program


def tokenize(text: str) -> list[str]:
    return re.findall(r"[a-z0-9]+", text.lower())


def retrieve_programs(query: str, k: int = 3) -> list[Program]:
    """Token-overlap ranking over the curated KB. Always returns at least one
    program (falls back to the first KB entry) so downstream matching always
    has something to reason about, mirroring the original prototype's
    fail-open-to-something-reviewable behaviour."""
    q = set(tokenize(query))
    scored: list[tuple[int, Program]] = []
    for p in PROGRAMS:
        corpus = " ".join(
            [p["name"], p["category"], " ".join(p["eligibility"]), " ".join(p["documents"]), " ".join(p["keywords"])]
        )
        tokens = set(tokenize(corpus))
        scored.append((len(q & tokens), p))
    scored.sort(key=lambda x: x[0], reverse=True)
    ranked = [p for score, p in scored[:k] if score > 0]
    return ranked or [PROGRAMS[0]]


def deterministic_match(situation: dict[str, Any], programs: list[Program]) -> list[DeterministicCandidate]:
    """Per-program pass/fail-style checks against the extracted situation.
    This is intentionally simple keyword/field matching for the MVP KB; the
    Backend/Rules Engineer owns swapping this for the full data-driven rules
    engine (matched/failed/missing conditions) described in the shared spec
    without changing this function's signature or return shape."""
    text = " ".join(str(v) for v in situation.values() if v is not None).lower()
    matches: list[DeterministicCandidate] = []

    for p in programs:
        reasons: list[str] = []

        if p["program_id"] == "BISP_TALEEMI_WAZAIF":
            if any(kw in text for kw in ("school", "student", "education", "child")):
                reasons.append("The situation mentions education/school-age children.")

        elif p["program_id"] == "BISP_NASHONUMA":
            if situation.get("pregnancy_or_maternal_need") is True or "pregnan" in text:
                reasons.append("The situation indicates a pregnancy/maternal nutrition need.")
            if "child" in text or "baby" in text:
                reasons.append("The situation mentions a child/young-child need.")

        elif p["program_id"] == "PUNJAB_SOCIAL_WELFARE":
            province = situation.get("province")
            if province and "punjab" in str(province).lower():
                reasons.append("The stated province is Punjab.")
            elif any(kw in text for kw in ("support", "welfare", "assistance", "income", "job loss")):
                reasons.append("The situation indicates a general social-support/navigation need.")

        if reasons:
            matches.append(
                DeterministicCandidate(
                    program_id=p["program_id"],
                    name=p["name"],
                    reasons=reasons,
                    required_documents=p["documents"],
                    official_source=p["official_source"],
                )
            )

    return matches
