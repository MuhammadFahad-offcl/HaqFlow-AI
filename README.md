<div align="center">

# HaqFlow

**A calm, AI-assisted guide connecting people in Pakistan to the public support programs they qualify for.**

BISP · Bait-ul-Mal · Sehat Card · Provincial Welfare — after a job loss, medical emergency, or other life shock.

[![Backend](https://img.shields.io/badge/backend-FastAPI-009688)](./backend)
[![Frontend](https://img.shields.io/badge/frontend-React%2019%20%2B%20Vite-61DAFB)](./frontend)
[![LLM](https://img.shields.io/badge/LLM-Groq-orange)](https://console.groq.com)
[![Tests](https://img.shields.io/badge/backend%20tests-7%2F7%20passing-brightgreen)](./backend/tests)
[![License](https://img.shields.io/badge/status-hackathon%20prototype-lightgrey)](#)

[Quick Start](#-quick-start) • [Architecture](#-architecture) • [API](#-api-reference) • [Status](#-whats-live-vs-mocked) • [Deploy](#-deployment)

</div>

---

## ⚡ TL;DR

```bash
# backend
cd backend && python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt && cp ../.env.example .env   # add GROQ_API_KEY
uvicorn app.main:app --reload          # → http://localhost:8000/docs

# frontend (new terminal)
cd frontend && npm install
npm run dev                            # → http://localhost:3000
```

By default the frontend runs on **mock data — no backend required.** Flip `VITE_USE_MOCK=false` once your backend is up. See [Quick Start](#-quick-start) for the full walkthrough.

> **Golden rule:** the LLM extracts facts and explains results. It **never** decides eligibility and **never** invents a requirement, benefit amount, or source URL. A plain-Python rules engine decides matches; the LLM only explains them, in hedged language.

---

## 🧭 Architecture

```
Browser
   │  REST / JSON
   ▼
frontend/  (React + Vite)
src/services/api.ts
   • live mode  → fetch() calls to the backend
   • mock mode  → in-memory data, zero network
   │
   │  POST /api/v1/*
   ▼
backend/  (FastAPI — app/main.py)

 /intake  ───────► Intake Agent (Groq)
                    → structured facts only, no eligibility

 /match   ───────► retrieve_programs()      lexical retrieval
                    → deterministic_match()  pure Python, no LLM  ──► app/rag/programs.py
                    → Grounded Explanation    Groq, hedged language     (curated, source-linked KB)

 /analyze-document ► Document Agent (Groq vision for images;
                      PDFs conservatively flagged "needs_review")
```

<details>
<summary><b>Why this split?</b> (click to expand)</summary>

| Stage | Who decides | Can it hallucinate? |
|---|---|---|
| Fact extraction (`/intake`) | Groq LLM | No — nulls out anything unstated, never guesses |
| Program matching (`/match`) | **Plain Python** (`deterministic_match`) | No — deterministic, unit-tested |
| Explanation (`/match`) | Groq LLM | No — grounded only in what the rules layer already decided; forced to hedge ("appears to match", "needs verification") |
| Document evidence (`/analyze-document`) | Groq vision | Confidence-scored per field; low scores are never silently treated as verified |

</details>

---

## 📁 Project layout

```
haqflow/
├── frontend/           React 19 + TypeScript + Vite 6 + Tailwind v4
│   └── src/services/api.ts   ← the one file that switches live/mock
├── backend/             FastAPI + Groq agents + deterministic rules
│   ├── app/main.py            3 endpoints, CORS, error handling
│   ├── app/agents/            intake · explanation · document
│   ├── app/rag/                program KB + retrieval + rules
│   ├── demo_dashboard.py      optional Streamlit UI, same logic
│   └── tests/
├── .env.example          every env var, both sides, one place
└── .gitignore
```

---

## 🚀 Quick Start

<details open>
<summary><b>1. Backend</b></summary>

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example .env        # fill in GROQ_API_KEY → https://console.groq.com
uvicorn app.main:app --reload  # http://localhost:8000/docs
```

```bash
pytest    # 7 tests, run without a Groq key — cover the deterministic rules layer
```

Optional: swap the API for a Streamlit demo (same agents, same rules, no duplicated logic):

```bash
streamlit run demo_dashboard.py
```

</details>

<details open>
<summary><b>2. Frontend</b></summary>

```bash
cd frontend
npm install
cp ../.env.example .env    # keep only the VITE_* lines
npm run dev                # http://localhost:3000
```

| `.env` setting | Result |
|---|---|
| `VITE_API_BASE_URL` unset, **or** `VITE_USE_MOCK=true` | Runs on in-memory mock data. No backend needed — fastest for UI work. |
| `VITE_API_BASE_URL=http://localhost:8000` + `VITE_USE_MOCK=false` | Calls the real backend for intake, matching, and document analysis. Header shows a **"Live Backend"** badge instead of the demo toggles. |

</details>

---

## 🔌 API Reference

| Method | Path | Agent(s) involved | Request | Response |
|---|---|---|---|---|
| `POST` | `/api/v1/intake` | Intake Agent | `{ case_id, message, language }` | `IntakeResponse` — structured facts, `next_question` |
| `POST` | `/api/v1/match` | Retrieval → Rules → Grounded Explanation | `{ case_id, situation }` | `MatchResponse` — `candidates` (rules) + `matches` (explained) |
| `POST` | `/api/v1/analyze-document` | Document Agent | `multipart/form-data`: `file`, `case_id` | `DocumentAnalysisResponse` — per-field confidence |
| `GET` | `/health` | — | — | `{ status: "ok" }` |

Full interactive schema (try requests in-browser): **`http://localhost:8000/docs`**

Shared contract: `backend/app/models.py` (Pydantic) ↔ `frontend/src/types/index.ts` (`Api*` types) — change them together.

---

## ✅ What's live vs. mocked

| Screen / flow | Endpoint | Status |
|---|---|---|
| Intake chat | `POST /api/v1/intake` | 🟢 Live |
| Program matches + explanations | `POST /api/v1/match` | 🟢 Live |
| Document upload & analysis | `POST /api/v1/analyze-document` | 🟢 Live |
| Case overview / dashboard counts | — | 🟡 Mocked (local state) |
| Action plan tasks (create/update) | — | 🟡 Mocked (local state) |
| Crisis-language detection | — | ⚪ Client-side (`src/lib/safety.ts`), unrelated to the backend |

<details>
<summary><b>How to un-mock the rest</b></summary>

The mocked flows already follow the `Case` / `ActionItem` / `Program` shapes defined in `HaqFlow_Features_and_Tech_Stack.docx`, so this is additive, not a rewrite:

1. Add the route to `backend/app/main.py` (mirror how `/match` is built).
2. Add the matching method to `frontend/src/services/api.ts`, following the exact pattern used for `sendIntakeMessage` / `getMatchedPrograms` / `uploadDocument`.
3. Don't touch any screen component — they only ever talk to `services/api.ts`.

No database yet, either — today's backend is stateless per request. Adding Postgres/Supabase persistence for the `Case`/`Situation`/`MatchResult` objects is the next real milestone before this is feature-complete.

</details>

---

## ☁️ Deployment

| | Where | Notes |
|---|---|---|
| **Frontend** | Vercel / Netlify | Build: `npm run build` · Output: `dist` · Set `VITE_API_BASE_URL` + `VITE_USE_MOCK=false` |
| **Backend** | Render / Railway / Fly.io | Use `backend/Dockerfile` · Set `GROQ_API_KEY` + `CORS_ALLOW_ORIGINS` (include your frontend's deployed origin) |
| **Demo only** | Streamlit Community Cloud | Point it at `backend/demo_dashboard.py` |

---

## 🤝 Repository conventions

- 🔐 **No hardcoded secrets** — everything sensitive is an env var; only `.env.example` is committed.
- 🔗 **One shared contract** — `backend/app/models.py` and `frontend/src/types/index.ts` change together.
- 🌿 **Branch + PR** — nothing merges straight to `main`.

---

<div align="center">
<sub>HaqFlow surfaces navigation signals, not official eligibility decisions. Always verify with the issuing authority.</sub>
</div>
