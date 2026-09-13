# HaqFlow — Vercel Deployment Guide (read this before you redeploy)

This fixes the "API key + model set but no answers" problem. There were
**two bugs actually breaking it** (a frontend import bug, and two dead Groq
model IDs) plus a few deployment settings that are easy to get wrong on
Vercel specifically. Follow this in order.

---

## 0. What was actually broken (for your own understanding)

1. **Frontend bug**: `frontend/src/services/api.ts` imported the mock API
   from the wrong file (a circular re-export with nothing in it). Every
   screen's "Send" / "Find matches" / "Upload" button was calling into
   `undefined`. **Fixed** — now imports from `lib/mockApi.ts` correctly.
2. **Dead Groq models**: the app defaulted to `llama-3.3-70b-versatile`
   (Groq decommissioned it Aug 16, 2026) and
   `meta-llama/llama-4-scout-17b-16e-instruct` (decommissioned Jul 17,
   2026). Every Groq call was failing with a 400 even with a perfectly
   valid key. **Fixed** — now defaults to `openai/gpt-oss-120b` (text) and
   `qwen/qwen3.6-27b` (vision). Groq's model lineup changes often — if this
   ever happens again, check https://console.groq.com/docs/deprecations.
3. **CORS**: default only allowed `localhost:3000`, so a production
   frontend calling a production backend would get silently blocked by the
   browser. **Fixed** — defaults to `*` (safe here, no cookies are used).
4. **Bundle size risk**: `backend/requirements.txt` pulled in Streamlit
   (used only by the local demo dashboard) into every serverless deploy.
   **Fixed** — split into `requirements.txt` (prod) and
   `requirements-dev.txt` (local-only).

Everything below assumes this fixed code, pushed as-is to GitHub.

---

## 1. Push to GitHub

Push the **contents of this folder** (`backend/`, `frontend/`, etc.) to the
root of your repo — don't nest it inside another `haqflow/` folder, or the
"Root Directory" settings below won't line up.

---

## 2. Backend project on Vercel

**Create/reconfigure the backend Vercel project:**

- **Root Directory**: `backend`
- **Framework Preset**: "Other" (Vercel auto-detects FastAPI's `app` object
  once Root Directory points at the folder containing `app/main.py` — no
  build command needed)

**Environment Variables** (Project Settings → Environment Variables — set
for Production **and** Preview):

| Key | Value |
|---|---|
| `GROQ_API_KEY` | your real key from https://console.groq.com/keys |
| `GROQ_MODEL` | `openai/gpt-oss-120b` |
| `GROQ_VISION_MODEL` | `qwen/qwen3.6-27b` |
| `CORS_ALLOW_ORIGINS` | your frontend's exact URL, e.g. `https://haqflow-frontend.vercel.app` (comma-separate more than one; `*` also works and is the built-in default) |
| `APP_ENV` | `production` |

**Redeploy** after setting these (Deployments tab → ⋯ → Redeploy). Env var
changes never apply retroactively to an old deployment.

**Verify it immediately** — open this URL in a browser (replace with your
real backend domain):

```
https://YOUR-BACKEND.vercel.app/api/v1/diagnostics/groq
```

- ✅ `{"status":"ok", "groq_model":"openai/gpt-oss-120b", ...}` → backend +
  Groq are fully working. Move to step 3.
- ❌ `groq_not_configured` → `GROQ_API_KEY` isn't set on this deployment
  (check you set it on the right project/environment and redeployed).
- ❌ `groq_call_failed` with a message about the key or model → read the
  `details` field, it's Groq's own error message (invalid key, wrong
  region, rate limit, etc.).
- ❌ Page doesn't load at all / 404 → the Root Directory setting is wrong,
  or Vercel didn't detect `app/main.py` as the FastAPI entrypoint. Check
  the build logs for "Python" — if it built as a static site instead, the
  Root Directory isn't pointing at the `backend` folder.

Also sanity-check:
```
https://YOUR-BACKEND.vercel.app/health
```
should return `{"status":"ok", ...}` instantly, with no Groq call involved.

---

## 3. Frontend project on Vercel

**Root Directory**: `frontend`
**Framework Preset**: Vite (auto-detected)

**Environment Variables** (Production **and** Preview):

| Key | Value |
|---|---|
| `VITE_API_BASE_URL` | `https://YOUR-BACKEND.vercel.app` (no trailing slash — code strips it defensively anyway, but keep it clean) |
| `VITE_USE_MOCK` | `false` |

⚠️ **This is the step people most often get wrong**: Vite bakes these
values into the JavaScript bundle **at build time**, not at runtime. If you
set/change these env vars, you **must trigger a new deployment** (Redeploy,
or push a new commit) for them to take effect — refreshing the live site
alone does nothing.

**Redeploy**, then open the site and check the browser DevTools Network
tab while using the app — you should see requests going to
`https://YOUR-BACKEND.vercel.app/api/v1/...` returning `200`.

---

## 4. If it's still not working — a 2-minute checklist

1. Open `https://YOUR-BACKEND.vercel.app/api/v1/diagnostics/groq` — if this
   isn't a clean `"status":"ok"`, the problem is 100% on the backend/Groq
   side, not the frontend. Fix that first.
2. Open the deployed frontend, open DevTools → Console. A "Failed to
   fetch" / CORS error means `CORS_ALLOW_ORIGINS` on the backend doesn't
   include your frontend's exact URL (scheme + domain, no path).
3. In DevTools → Network, click a failed `/api/v1/...` request. If it
   never left the browser (status shows "(failed)" with no response), it's
   CORS or the backend is unreachable (wrong `VITE_API_BASE_URL`, or the
   backend deployment itself is down — check step 2 above).
4. If requests succeed (200) but the UI still looks empty/mock-like,
   double check `VITE_USE_MOCK=false` was set **before** the last build —
   redeploy again to be sure.
5. Confirm you copied the Groq key correctly (no quotes, no trailing
   space) — paste it into Project Settings, don't type it.

---

## 5. Local testing (optional, if you have time before 11pm)

```bash
# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp ../.env.example .env   # then fill in GROQ_API_KEY
uvicorn app.main:app --reload
# -> http://localhost:8000/api/v1/diagnostics/groq should say "status":"ok"

# Frontend (separate terminal)
cd frontend
npm install
echo 'VITE_API_BASE_URL=http://localhost:8000' > .env
echo 'VITE_USE_MOCK=false' >> .env
npm run dev
# -> http://localhost:3000
```

Both `npm run build` (frontend) and `pytest` (backend, 7/7 passing) were
verified clean before this handoff.
