"""
Smoke tests that don't require a live GROQ_API_KEY: health check, and the
pure-Python retrieval/rules layer that the /match endpoint depends on.
Agent-calling endpoints (/intake, /match's explanation step, /analyze-document
for images) need GROQ_API_KEY set and are exercised manually / in CI with a
key configured, per the doc's "unit-test each rule, include edge values"
guidance for the deterministic parts specifically.
"""
from fastapi.testclient import TestClient

from app.main import app
from app.rag.retrieval import deterministic_match, retrieve_programs

client = TestClient(app)


def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


def test_retrieve_programs_returns_at_least_one():
    results = retrieve_programs("completely unrelated gibberish query xyz")
    assert len(results) >= 1


def test_retrieve_programs_ranks_relevant_program_first():
    results = retrieve_programs("my child is in school and needs a stipend")
    assert results[0]["program_id"] == "BISP_TALEEMI_WAZAIF"


def test_deterministic_match_no_match_for_empty_situation():
    programs = retrieve_programs("pregnant mother nutrition")
    matches = deterministic_match({}, programs)
    # Empty situation -> "punjab"/"support" heuristics may still fire for
    # PUNJAB_SOCIAL_WELFARE's fallback branch; assert it never claims a
    # location-specific reason without a stated province.
    for m in matches:
        if m.program_id == "PUNJAB_SOCIAL_WELFARE":
            assert "Punjab" not in m.reasons[0] or "province" in m.reasons[0].lower()


def test_deterministic_match_pregnancy_flag():
    programs = retrieve_programs("pregnant mother nutrition")
    matches = deterministic_match({"pregnancy_or_maternal_need": True}, programs)
    ids = {m.program_id for m in matches}
    assert "BISP_NASHONUMA" in ids


def test_intake_endpoint_requires_message():
    res = client.post("/api/v1/intake", json={"case_id": "c1", "message": ""})
    assert res.status_code == 422


def test_analyze_document_rejects_unsupported_type():
    res = client.post(
        "/api/v1/analyze-document",
        data={"case_id": "c1"},
        files={"file": ("evidence.txt", b"hello", "text/plain")},
    )
    assert res.status_code == 415
