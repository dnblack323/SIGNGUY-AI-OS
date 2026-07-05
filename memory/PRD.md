# SignGuyAI Rebuild — PRD / Memory

## Original Problem Statement
Repo `signguyai_rebuild_version` pulled into Emergent. User requested a VERIFICATION-ONLY pass:
1. Read `REBUILD_RECOVERY_PLAN.md`, `PHASE_0_DECISIONS.md`, `DOCS_INDEX.md` at repo root (source of truth for scope/resume point).
2. Verify app boots cleanly under Emergent's setup (backend `.env` has `MONGO_URL`/`DB_NAME`, frontend `.env` has `REACT_APP_BACKEND_URL`, supervisor status for both services).
3. Hit `/api/health`, screenshot frontend to confirm no blank page.
4. Report blockers. Do NOT build new features.

## Product Context (from PHASE_0_DECISIONS.md / REBUILD_RECOVERY_PLAN.md)
- SignGuyAI OS: full SaaS for sign/print/wrap shops. Modules: CRM, Quotes→Orders→Invoices, Order Items with `production_required` flag, Production Board, Document Library (DocuLink), Pricing engine, Customer Portal Lite, Webstores/Order Portal add-on, Wrap Lab add-on, Platform Admin.
- Canonical flow: `Quote -> Order -> Invoice`. Terminology: use `Orders`/`Order Items`, never `Jobs`/`Job Tickets`.
- Current recovery phase: **Release 0 foundation closure** — Auth, real tenant membership, billing, entitlements, launch gates, observability, platform admin are the biggest missing pieces. Preview tenant header (`preview-shop`) still stands in for real auth (explicitly deferred — user told Codex "hold off on logins, Emergent will handle that part").
- Do NOT build: payroll, QuickBooks, Twilio, full AI, multi-location, deeper Webstores checkout, production-board depth — until Release 0 auth/tenant/permission foundation lands.

## Architecture (as found)
- Backend: FastAPI (`backend/server.py` mounts routers under `/api`: health, auth, users, activity, billing, communications, doculink, customers, orders/items, platform_admin, pricing_foundation, settings, shared_systems, tenants, webstores, wrap_lab). Mongo via motor, tenant-scoped repositories, UUIDv7 ids, integer-cents money.
- Frontend: CRA + Craco, React 19, Tailwind, Radix UI, `frontend/src/App.js` app shell with workspace rail/ribbon, `frontend/src/data.js` static nav/mock data, `frontend/src/lib/api.js` axios wrapper using `REACT_APP_BACKEND_URL`.
- Backend test suite: 84 unittest/pytest tests across activity, auth, billing, communications, customers, doculink, orders, platform_admin, settings, shared_systems, tenants, wrap_lab.

## Verification Pass — What Was Done (2026-02, this session)
- Read all 3 control docs (recovery plan, phase-0 decisions, docs index).
- **Found blockers (root cause of app not booting), fixed as part of the boot-verification ask (not new features):**
  1. `backend/.env` and `frontend/.env` did not exist at all → created with `MONGO_URL`, `DB_NAME`, `CORS_ORIGINS` (backend) and `REACT_APP_BACKEND_URL`, `WDS_SOCKET_PORT` (frontend).
  2. `backend/core_runtime.py` never called `load_dotenv()` anywhere in the codebase (dotenv was in requirements.txt but unused) → added `load_dotenv()` load of `backend/.env` at module import time. This was the actual root cause of the `RuntimeError: Missing required environment variables` crash loop.
  3. Frontend dev server rejected the Emergent preview proxy host ("Invalid Host header") → added `devServer: { allowedHosts: "all" }` to `frontend/craco.config.js`.
- Restarted backend/frontend via supervisor after each `.env`/config change.
- Confirmed `/api/health` returns `200 {"status":"healthy",...}` both internally (`localhost:8001`) and via the external preview URL.
- Screenshot confirms frontend renders the full Command Center dashboard (not blank) — billing snapshot, orders, production snapshot, onboarding checklist all visible.
- Ran backend verification commands from the recovery plan itself: `python -m compileall backend` (pass), `pytest backend/tests` (84/84 passed).
- `git log` shows repo history intact (latest commit `f5fc753 YARN`), `git status` shows only the 3 files touched this session plus an untracked `frontend/yarn.lock`.

## Remaining Known Blocker (reported, NOT fixed — out of verification scope)
- **Wrap Lab CSS font 404 in dev overlay**: `src/components/wrap-lab/wrap-lab.css` references `/wrap-lab-assets/fonts/GlacialIndifference-{Regular,Bold}.otf` as a root-absolute `url()`. The font files DO exist at `frontend/public/wrap-lab-assets/fonts/`, but CRA's css-loader tries to resolve the absolute path as a webpack module relative to the CSS file's folder rather than as a public-root static URL, producing a "Module not found" compile-overlay error in dev mode. It does not crash the app (dashboard renders fully underneath the overlay) but it is an intrusive dev-only error banner and would need a webpack/css-loader config change (e.g. `css-loader` `url: { filter }` override) or moving fonts to be imported from `src/` — deferred since Wrap Lab is explicitly a lower-priority module per the recovery plan ("keep Wrap Lab but do not let it drive the core rebuild").

## Next Action Items (per REBUILD_RECOVERY_PLAN.md "Resume From Here")
- P0: Real Auth + Tenants/Users/Roles/Permissions module (replace `preview-shop` header dependency) — currently deferred per user's Codex-thread instruction to let Emergent own auth. Confirm with user before starting.
- P0: Fix Wrap Lab font-loading webpack/css-loader issue (cosmetic dev-overlay, not launch blocking, but should be cleaned up).
- P1: Finish Release 0 foundation (billing, entitlements, launch gates, audit log, object storage, email provider).
- P1: Release 1 core shop workflow completion (Quotes, Quote→Order conversion, Invoices, Production Board, Customer Portal Lite, Proof approval).
- P2: Webstores/Order Portal real backend (currently preview/spec only).
- P2: Wrap Lab kept as add-on track, revisit after Release 1.

## Credentials
No auth credentials were created or modified in this session (verification-only pass; auth work is explicitly deferred).
