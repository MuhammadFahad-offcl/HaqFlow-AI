"""
HaqFlow — Streamlit demo dashboard.

Thin UI over the exact same modules `app/main.py` uses — no logic is
duplicated here. Useful for a quick internal demo without running the API
server, or for eyeballing agent output while iterating on prompts.

Run:
    streamlit run demo_dashboard.py

Requires GROQ_API_KEY to be set in the environment or Streamlit secrets
(st.secrets is copied into os.environ below so app/config.py picks it up
the same way it would from a real .env file).
"""
from __future__ import annotations

import json
import os

import streamlit as st

# Make Streamlit secrets visible to the shared Settings loader before any
# app.* module is imported, so both run paths (API server vs. this demo)
# read configuration identically.
for key in ("GROQ_API_KEY", "GROQ_MODEL", "GROQ_VISION_MODEL"):
    if key in st.secrets and key not in os.environ:
        os.environ[key] = st.secrets[key]

from app.agents.document import analyze_document_bytes  # noqa: E402
from app.agents.explanation import run_grounded_explanation  # noqa: E402
from app.agents.intake import run_intake_agent  # noqa: E402
from app.config import settings  # noqa: E402
from app.rag.programs import PROGRAMS  # noqa: E402
from app.rag.retrieval import deterministic_match, retrieve_programs  # noqa: E402

st.set_page_config(page_title="HaqFlow AI/RAG", page_icon="🤝", layout="wide")

st.title("🤝 HaqFlow — AI / RAG / Document Intelligence")
st.caption("Internal demo dashboard • wraps the same agents/rules used by the FastAPI backend")

with st.sidebar:
    st.header("Configuration")
    st.write("Add `GROQ_API_KEY` in Streamlit Cloud → Settings → Secrets, or a local `.env`.")
    st.write("Optional secret: `GROQ_MODEL`")
    st.write("Optional vision secret: `GROQ_VISION_MODEL`")
    if not settings.groq_api_key:
        st.error("GROQ_API_KEY is not configured — agent calls below will fail until it is set.")
    st.divider()
    st.info("Demo data is curated and source-linked. This prototype does not make official eligibility decisions.")

tab1, tab2, tab3 = st.tabs(["1. Situation → RAG", "2. Document Analyzer", "3. Program Knowledge Base"])

with tab1:
    st.subheader("Tell HaqFlow what happened")
    example = "My father lost his daily-wage job. We are six people. My sister is in school and my mother is pregnant. We live in Punjab."
    user_text = st.text_area("Situation", value=example, height=130)

    if st.button("Analyze situation", type="primary"):
        try:
            with st.spinner("Extracting situation..."):
                situation = run_intake_agent(user_text)
            st.session_state["situation"] = situation.model_dump()

            with st.spinner("Retrieving relevant programs..."):
                query = user_text + " " + json.dumps(st.session_state["situation"])
                retrieved = retrieve_programs(query)
                candidates = deterministic_match(st.session_state["situation"], retrieved)
            st.session_state["retrieved"] = retrieved
            st.session_state["candidates"] = [c.model_dump() for c in candidates]

            with st.spinner("Generating grounded explanation..."):
                summary, matches, global_warning = run_grounded_explanation(
                    st.session_state["situation"], candidates
                )
            st.session_state["explanation"] = {
                "summary": summary,
                "matches": [m.model_dump() for m in matches],
                "global_warning": global_warning,
            }
        except Exception as e:
            st.error(str(e))

    if "situation" in st.session_state:
        st.markdown("### UserSituation JSON")
        st.json(st.session_state["situation"])

    if "retrieved" in st.session_state:
        st.markdown("### Retrieved verified context")
        for p in st.session_state["retrieved"]:
            with st.expander(f'{p["name"]} — {p["category"]}'):
                st.write("**Program ID:**", p["program_id"])
                st.write("**Eligibility conditions:**")
                for x in p["eligibility"]:
                    st.write("•", x)
                st.write("**Required documents:**")
                for x in p["documents"]:
                    st.write("•", x)
                st.write("**Application steps:**")
                for x in p["steps"]:
                    st.write("•", x)
                st.markdown(f'**Official source:** [{p["official_source"]}]({p["official_source"]})')

    if "explanation" in st.session_state:
        st.markdown("### Grounded explanation")
        e = st.session_state["explanation"]
        st.success(e.get("summary", ""))
        for m in e.get("matches", []):
            st.markdown(f'#### {m.get("program_id")}')
            st.write("**Why it appears relevant:**", m.get("why_it_appears_relevant", ""))
            st.write("**Missing evidence:**")
            for x in m.get("missing_evidence", []):
                st.write("•", x)
            st.write("**Next steps:**")
            for x in m.get("next_steps", []):
                st.write("•", x)
            st.write("**Verification:**", m.get("verification", ""))
        st.warning(e.get("global_warning", ""))

with tab2:
    st.subheader("Upload a sample document")
    st.caption(
        "Use synthetic/demo documents. Clear JPG/PNG images are analyzed by the multimodal Groq model. "
        "PDFs are conservatively flagged for review in this simple MVP."
    )
    uploaded = st.file_uploader("Document", type=["png", "jpg", "jpeg", "webp", "pdf"])

    if uploaded and st.button("Analyze document"):
        try:
            with st.spinner("Analyzing evidence..."):
                result = analyze_document_bytes(uploaded.name, uploaded.getvalue())
            st.session_state["document_result"] = result.model_dump()
        except Exception as e:
            st.error(str(e))

    if "document_result" in st.session_state:
        st.markdown("### Document JSON")
        st.json(st.session_state["document_result"])
        if st.session_state["document_result"].get("overall_confidence", 0) < 0.75:
            st.warning("Low-confidence evidence must be reviewed/confirmed; it is not treated as verified fact.")

with tab3:
    st.subheader("Curated program knowledge base")
    st.write(f"{len(PROGRAMS)} source-linked programs are included for the MVP.")
    st.dataframe(
        [
            {
                "Program ID": p["program_id"],
                "Program": p["name"],
                "Category": p["category"],
                "Official Source": p["official_source"],
            }
            for p in PROGRAMS
        ],
        use_container_width=True,
        hide_index=True,
    )
    st.info("For the final team merge, the Data/KB member can expand this list to 5–10 verified programs.")

st.divider()
st.caption("HaqFlow prototype: matches are navigation signals, not official eligibility determinations.")
