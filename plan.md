# SignGuy AI MVP (FARM) — UPDATED plan.md

## Objectives (Updated)
- ✅ Deliver a working multi-tenant shop-management MVP: **Customer → Quote → Order (+OrderItems) → Work Orders (0..N) → Invoice (0..1) → Payments**, with shared **Documents**, **Email**, **Audit**, **Dashboard**.
- ✅ Prove and integrate the two failure-prone integrations first:
  1) **Mongo atomic sequence generator** (race-safe)
  2) **Object storage** upload/download with tenant-scoped storage paths
- ✅ Enforce non-negotiables throughout: **tenant isolation**, **one permission dependency**, **idempotency guards**, **append-only AuditEvent with REQUIRED actor fields**, **no `_id` in API responses**, **money in integer cents**, correct terminology (**Work Order**, never “Job Ticket”).
- ✅ Provide a **Dev Auth Bypass** mode to allow UI testing without login when desired (**AUTH_DEV_BYPASS=true**), with a prominent UI banner and an explicit note to disable before production.
- 🔜 Next hardening steps (post-MVP):
  - Add real SendGrid keys (Restricted Access / Mail Send only) and validate live sends.
  - (Optional) Add real binary attachments to SendGrid outbound emails (currently logged only).
  - (Optional) Add attachment UI widgets on entity detail pages (backend supports).

---

## Phase 0 — POC (Isolation): Mongo atomic numbering + Object Storage
**Status:** ✅ Completed

**User stories**
1. As an admin, I want Quote/Order/WorkOrder/Invoice numbers to be unique per tenant even under concurrent creates.
2. As a staff user, I want to upload a file once and attach it to multiple records without re-uploading.
3. As a staff user, I want files to be private-by-default and accessible only when authorized.
4. As an admin, I want storage paths to enforce tenant isolation.
5. As a developer, I want a storage abstraction so we can swap providers later.

**Implementation steps (as delivered)**
- ✅ Implemented atomic sequence generator using Mongo `find_one_and_update($inc)` + upsert.
- ✅ Implemented Emergent object storage adapter using platform integration.
- ✅ POC script: `backend/scripts/poc_core.py`
  - Concurrency test for counters (0 duplicates, per-tenant isolation).
  - Upload + download integrity verification.
  - Tenant-scoped storage key convention.

**Deliverables**
- ✅ `scripts/poc_core.py` proves both atomic sequences and object storage round-trip.
- ✅ Storage abstraction in backend (`app/services/storage.py`).

**Success criteria**
- ✅ Sequence POC: 0 duplicates under concurrency; tenant-isolated counters.
- ✅ Storage POC: upload+download works; tenant path isolation enforced.

---

## Phase 1 — Scaffold + Auth + Tenant + Permissions + Sequence (App foundation)
**Status:** ✅ Completed

**User stories**
1. As a user, I can register a tenant and log in to get a backend-verified session.
2. As an owner, I can create staff users and assign roles.
3. As staff, I can only access routes my role permits.
4. As any user, I can request a password reset and use a single-use token within 60 minutes.
5. As the system, every entity created gets a tenant-scoped sequential number when applicable.

**Implementation steps (as delivered)**
- ✅ Fresh repo scaffold (no prior repo code copied).
- ✅ FastAPI backend with Motor/Mongo.
- ✅ Auth: bcrypt password hashing, JWT access token, logout.
- ✅ Password reset: single-use token, 60-minute expiry.
- ✅ Tenant model and tenant_id on every domain record.
- ✅ Exactly one shared permission dependency (`app/deps.py::require_permission`).
- ✅ Permissions are fetched by frontend from `/api/auth/me` (no frontend-maintained permission enum).
- ✅ Shared atomic sequence service (`app/services/sequence.py`).

**Deliverables**
- ✅ Working auth, roles, permissions, tenant isolation, atomic numbering.

**Success criteria**
- ✅ Testing agent verified auth flows and permission enforcement (staff cannot `user:write`).

---

## Phase 2 — Customers
**Status:** ✅ Completed

**User stories**
1. As staff, I can create a Customer with contact info and notes.
2. As staff, I can search/list customers and open a profile.
3. As staff, I can edit customer details with audit history recorded.
4. As staff, I can see linked Quotes/Orders/Work Orders/Invoices/Emails on the customer page.
5. As owner, I can’t see another tenant’s customers even if I guess an ID.

**Implementation steps (as delivered)**
- ✅ Customer CRUD endpoints.
- ✅ Customer list + detail UI.
- ✅ Related-records endpoint `/api/customers/{id}/related`.
- ✅ Audit logging wired for create/update/archive.

**Deliverables**
- ✅ Customers pages + API + audit events.

**Success criteria**
- ✅ Cross-tenant fetch returns 404; audit events recorded.

---

## Phase 3 — Quotes (manual price) + Convert-to-Order (idempotent)
**Status:** ✅ Completed

**User stories**
1. As staff, I can create a draft Quote with manual total price.
2. As staff, I can set Quote status draft/sent/approved/declined.
3. As staff, I can convert a Quote to exactly one Order (double-click safe).

**Implementation steps (as delivered)**
- ✅ Quote CRUD + status endpoints.
- ✅ Sequential quote numbering.
- ✅ Convert-to-order idempotency implemented with `find_one_and_update` claim guard.
- ✅ Frontend quote list/detail + convert button.

**Deliverables**
- ✅ Quote module + conversion workflow.

**Success criteria**
- ✅ Testing agent verified idempotent convert returns same order on repeated calls.

---

## Phase 4 — Orders + Order Items
**Status:** ✅ Completed

**User stories**
1. As staff, I can create an Order for a customer (from quote or standalone).
2. As staff, I can add 1..N Order Items with manual description + manual price.
3. As staff, I can move order status through draft→confirmed→in_production→completed/cancelled.

**Implementation steps (as delivered)**
- ✅ Order CRUD + status transition endpoint.
- ✅ Order items sub-resource endpoints.
- ✅ Frontend order list/detail with inline editable items table.

**Deliverables**
- ✅ Orders + Order Items fully usable.

**Success criteria**
- ✅ Testing agent verified order item add/update/delete + status transitions.

---

## Phase 5 — Work Orders (0..N per Order)
**Status:** ✅ Completed (Multiple per Order enabled)

**User stories**
1. As staff, I can create multiple Work Orders for one Order.
2. As staff, I can include production instructions + internal notes.
3. As staff, I can set production status (not_started/in_progress/on_hold/completed).
4. As staff, I can snapshot Order Items into the Work Order at creation.

**Implementation steps (as delivered)**
- ✅ WorkOrder model + sequential numbering.
- ✅ Create-from-order service that snapshots order items.
- ✅ Frontend list/detail with production status updates.

**Deliverables**
- ✅ Work Orders module with status.

**Success criteria**
- ✅ Testing agent verified multiple work orders per single order.

---

## Phase 6 — Invoice (0..1 per Order) + Payments
**Status:** ✅ Completed (One per Order enforced)

**User stories**
1. As staff, I can create an Invoice from an Order once (idempotent guard).
2. As staff, I can record multiple partial payments and see balance due.
3. As staff, invoice status updates automatically (partially_paid/paid).

**Implementation steps (as delivered)**
- ✅ Invoice model with unique index `(tenant_id, order_id)` to enforce one-per-order.
- ✅ Invoice creation endpoint returns `already_exists=true` when attempted twice.
- ✅ Payment model linked to invoice; idempotency via `Idempotency-Key`.
- ✅ Auto status derivation after payments.
- ✅ Frontend invoice list/detail + payment panel.

**Deliverables**
- ✅ Invoices + payments working end-to-end.

**Success criteria**
- ✅ Testing agent verified invoice idempotency + payment dedupe + paid status.

---

## Phase 7 — Documents/Files + Attachments (shared)
**Status:** ✅ Completed

**User stories**
1. As staff, I can upload a file once and attach it to records.
2. As staff, I can mark a file internal-only or customer-visible.
3. As staff, I can download/view only when authorized.
4. As owner, I can verify no file endpoint works without auth + tenant scope.

**Implementation steps (as delivered)**
- ✅ `files` collection (metadata + storage_key) + `attachments` collection.
- ✅ Upload endpoint `POST /api/files/upload` (multipart) with validation.
- ✅ Download + view endpoints proxy through backend and require auth/tenant scope.
- ✅ Tenant path enforcement: storage key must contain `/tenants/{tenant_id}/`.
- ✅ Frontend Documents page (upload/list/toggle visibility/download/archive).

**Deliverables**
- ✅ App-wide shared file system.

**Success criteria**
- ✅ Testing agent verified unauth download blocked (401) and cross-tenant blocked (404).

---

## Phase 8 — SendGrid Email (env wiring now; keys later) + Email Log
**Status:** ✅ Completed (graceful-failure mode)

**User stories**
1. As staff, I can draft a custom message and send email for Quote/Invoice/general.
2. As staff, I can use templates: Quote sent, Invoice sent, Invoice reminder, Document sent, General.
3. As staff, I can see email history.
4. As staff, email failures are logged and shown clearly.

**Implementation steps (as delivered)**
- ✅ Shared email service (`app/services/email.py`) with SendGrid SDK.
- ✅ Env-var config only; when unconfigured, logs `sendgrid_not_configured` and does not crash.
- ✅ EmailLog stored and queryable from `/api/emails/history`.
- ✅ Frontend compose modal and Email History page.

**Deliverables**
- ✅ Email send + templates + log.

**Known gap / next step**
- 🔜 Binary attachments are not encoded into outbound SendGrid payload yet.
  - Current behavior: attachment `file_ids` are logged for traceability.

**Success criteria**
- ✅ Testing agent verified email send returns 201 and logs failed when unconfigured.

---

## Phase 9 — Audit review + Dashboard
**Status:** ✅ Completed

**User stories**
1. As staff, I can see a dashboard of active Orders, attention Work Orders, unpaid Invoices.
2. As staff, I can see recent emails and recent activity.
3. As owner, I can view audit history on each record.
4. As staff, every meaningful write produces exactly one audit entry.

**Implementation steps (as delivered)**
- ✅ Shared AuditEvent helper with REQUIRED actor fields (`record_audit`).
- ✅ Audit list endpoint `/api/audit`.
- ✅ Dashboard aggregation endpoint `/api/dashboard/summary`.
- ✅ Frontend dashboard page with focused lists (no charts).

**Deliverables**
- ✅ Dashboard + audit trail view components.

**Success criteria**
- ✅ Testing agent verified actor fields present for all events.

---

## Phase 10 — Full end-to-end test pass
**Status:** ✅ Completed

**User stories**
1. As an owner, I can complete the full workflow without hitting errors.
2. As staff, I can’t access other tenants’ records/files even with direct URLs.
3. As staff, double-click actions don’t create duplicates (convert/invoice/payment/email).
4. As staff, the UI navigation pages all load and basic CRUD works.

**Implementation steps (as delivered)**
- ✅ Backend smoke + testing agent suite: auth, tenant isolation, happy-path workflow, idempotency, file auth sweep.
- ✅ Frontend smoke: navigation + create/edit flows.

**Deliverables**
- ✅ Testing report: 100% backend pass (64/64) + frontend flow verification.

**Success criteria**
- ✅ Acceptance criteria met end-to-end; no unauthenticated file access; no cross-tenant leakage.

---

## Post-MVP Addendum — Dev Auth Bypass (per user request)
**Status:** ✅ Completed

**Goal**
Temporarily disable worrying about login while doing product iteration.

**Implementation**
- ✅ Backend env flag: `AUTH_DEV_BYPASS=true|false`.
- ✅ Endpoints:
  - `GET /api/auth/dev-config` → `{ dev_bypass: boolean }`
  - `POST /api/auth/dev-login` → provisions/returns a Dev Shop owner JWT (DEV ONLY)
- ✅ Frontend:
  - Auto-calls dev-login when no token exists and bypass is enabled.
  - Shows an amber banner: “Auth bypass ON… set AUTH_DEV_BYPASS=false before deploying.”

**Safety / Deployment requirement**
- 🔒 MUST set `AUTH_DEV_BYPASS=false` before any production deployment.

---

## Next Actions / Backlog (Optional Enhancements)
1. **SendGrid live validation**
   - Provide `SENDGRID_API_KEY` (Restricted Access, Mail Send only) and `SENDGRID_FROM_EMAIL`.
2. **Email attachments**
   - Implement attaching files to outbound SendGrid email (base64 encode per SendGrid spec) while continuing to store files in object storage.
3. **Entity-level attachment UI**
   - Add attachment widgets to Quote/Order/WorkOrder/Invoice detail pages using existing backend endpoints:
     - `POST /api/files/upload` with `parent_type/parent_id`
     - `POST /api/files/attach` for existing file reuse
     - `GET /api/files?parent_type=...&parent_id=...`
4. **UX polish**
   - Sorting controls, pagination UI, file preview modal, column density tweaks.
