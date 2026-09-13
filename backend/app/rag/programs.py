"""
Curated, source-linked program knowledge base.

Per HaqFlow_Features_and_Tech_Stack.docx §Source & Trust Layer: every program
shown to the user must carry an official_source URL, and the model must never
be relied on for current program details from memory. This list is the single
place to expand the KB (target: 5-10 verified programs for the demo province).

For the hackathon this lives as a Python list. The intended production path
(per the same doc, §1 Shared Architecture) is PostgreSQL + pgvector — swap
`retrieval.retrieve_programs` for a vector-similarity query against a
`programs` table seeded from this same data without changing its callers.
"""
from __future__ import annotations

from typing import Any

Program = dict[str, Any]

PROGRAMS: list[Program] = [
    {
        "program_id": "BISP_TALEEMI_WAZAIF",
        "name": "Benazir Taleemi Wazaif",
        "category": "Education",
        "official_source": "https://www.bisp.gov.pk/Detail/YzNlY2Q2ZGYtNjIwZS00MjNiLWFhMmEtZGM5NWNkMjZhMjQ3",
        "eligibility": [
            "Child is part of a BISP/Benazir Kafaalat beneficiary household.",
            "Child is enrolled in an eligible educational institution.",
            "Published program conditions and school attendance requirements must be verified.",
        ],
        "documents": [
            "B-form/child registration document",
            "School enrollment/admission information",
            "BISP/Kafaalat beneficiary information",
        ],
        "steps": [
            "Confirm household/beneficiary status.",
            "Confirm the child's school enrollment and required attendance.",
            "Follow BISP's published enrollment/application process.",
        ],
        "keywords": ["school", "student", "child", "education", "stipend", "b-form", "school fees"],
    },
    {
        "program_id": "BISP_NASHONUMA",
        "name": "Benazir Nashonuma Programme",
        "category": "Nutrition / Social Protection",
        "official_source": "https://www.bisp.gov.pk/Detail/YjAyMjI5ZDQtMTVkOC00YTNlLWE5NjctMjA1NTYwN2JhOTE3",
        "eligibility": [
            "The household must meet the program's published beneficiary conditions.",
            "The program is designed around nutrition support for eligible women and young children.",
            "Final eligibility must be verified through the official program process.",
        ],
        "documents": [
            "CNIC of relevant household member",
            "Child/woman identity or registration evidence as applicable",
            "Program-specific verification documents",
        ],
        "steps": [
            "Check whether the household is covered by the relevant BISP process.",
            "Confirm maternal/child eligibility at an authorized Nashonuma facility.",
            "Complete official enrollment/verification requirements.",
        ],
        "keywords": ["pregnant", "pregnancy", "mother", "nutrition", "child", "baby", "nashonuma"],
    },
    {
        "program_id": "PUNJAB_SOCIAL_WELFARE",
        "name": "Punjab Social Welfare & Protection Services",
        "category": "Social Support",
        "official_source": "https://punjab.gov.pk/social-welfare-and-protection",
        "eligibility": [
            "Eligibility depends on the specific Punjab social-welfare service.",
            "Geographic and program-specific conditions must be checked for the selected service.",
            "This knowledge-base entry is a navigation route, not an official eligibility decision.",
        ],
        "documents": [
            "CNIC or identity evidence where required",
            "Documents supporting the selected service",
            "Any program-specific evidence requested by the responsible authority",
        ],
        "steps": [
            "Identify the relevant Punjab social-welfare service.",
            "Review the official service requirements.",
            "Apply through the official channel and complete verification.",
        ],
        "keywords": ["social welfare", "punjab", "support", "assistance", "family", "welfare"],
    },
]
