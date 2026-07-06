# SignGuy AI MVP (FARM) — plan.md

## Objectives
- Deliver a working multi-tenant shop-management MVP: Customer → Quote → Order(+OrderItems) → Work Orders (0..N) → Invoice (0..1) → Payments, with shared Documents, Email, Audit, Dashboard.
- Prove the two failure-prone integrations first: (1) Mongo atomic sequence generator, (2) Object storage upload + private signed download.
- Enforce non-negotiables: tenant isolation, one permission dependency, idempotency guards, append-only AuditEvent, no `_id` in responses, money in cents, correct terminology.

---

## Phase 0 — POC (Isolation): Mongo atomic numbering + Object Storage
**User stories**
1. As an admin, I want Quote/Order/WorkOrder/Invoice numbers to be unique per tenant even under concurrent creates.
2. As a staff user, I want to upload a file once and attach it to multiple records without re-uploading.
3. As a staff user, I want files to be private-by-default and accessible only via signed URLs.
4. As an admin, I want storage paths to enforce tenant isolation.
5. As a developer, I want a storage abstraction so we can swap providers later.

**Implementation steps**
- Websearch/playbooks: confirm best-practice patterns for Motor `find_one_and_update($inc)` and platform object-storage signed URLs.
- POC script 1: `scripts/poc_sequence.py`
  - Create `counters` collection; `find_one_and_update` with `$inc`, `return_document=AFTER`, upsert.
  - Spawn N concurrent tasks; assert uniqueness + monotonicity per `(tenant_id, seq_name)`.
- POC script 2: `scripts/poc_storage.py`
  - Upload a sample file to path `tenants/{tenant_id}/files/{uuid}`.
  - Persist only metadata + storage_key.
  - Request signed GET URL; download and verify bytes.
  - Verify cross-tenant access denied (wrong tenant path / signed url scope).

**Deliverables**
- Two runnable scripts + minimal shared helpers (`sequence_service.py`, `storage_service.py`).
- Short ADR note in `docs/adr-0001-architecture.md` (fresh repo, key decisions).

**Next actions**
- Run both scripts locally; do not proceed until they pass reliably.

**Success criteria**
- Sequence POC: 0 duplicates under concurrency; unique index supports it.
- Storage POC: upload+signed-download works; no public objects; tenant path isolation enforced.

---

## Phase 1 — Scaffold + Auth + Tenant + Permissions + Sequence (App foundation)
**User stories**
1. As a user, I can register/seed an Owner and log in to get a backend-verified session.
2. As an owner, I can create staff users and assign roles.
3. As staff, I can only access routes my role permits.
4. As any user, I can request a password reset and use a single-use token within 60 minutes.
5. As the system, every entity created gets a tenant-scoped sequential number when applicable.

**Implementation steps**
- Repo scaffold: `backend/` FastAPI+Motor, `frontend/` React+Vite+TS+Tailwind+shadcn.
- Core backend modules: config (env), db, ids (UUID), money type (int cents), time utils.
- Auth: bcrypt hashing, JWT access, refresh/session strategy, logout, password reset token model.
- Tenant model + middleware/dependency to resolve `current_tenant`.
- One permission dependency (default-deny); endpoint to fetch permission list for current user.
- Integrate sequence service from POC; add unique indexes `(tenant_id, number)` per entity.
- Add basic Settings page (current user, role, permissions).

**Deliverables**
- Working login/logout/reset; role+permission enforcement; sequence generator live.

**Next actions**
- Add design agent output (tokens/components) before Phase 2 UI build-out.

**Success criteria**
- pytest: auth flows + tenant isolation on a sample protected route.
- Frontend can log in and render nav gated by server-provided permissions.

---

## Phase 2 — Customers
**User stories**
1. As staff, I can create a Customer with contact info and notes.
2. As staff, I can search/list customers and open a profile.
3. As staff, I can edit customer details with audit history recorded.
4. As staff, I can see linked Quotes/Orders/Work Orders/Invoices/Documents/Emails on the customer page.
5. As owner, I can’t see another tenant’s customers even if I guess an ID.

**Implementation steps**
- Customer CRUD router + service layer + models + indexes.
- Customer profile page + list page.
- Add audit logging helper (required actor param) and wire it for all writes.

**Deliverables**
- Customers pages + API + audit events.

**Next actions**
- Proceed to Quotes once Customer linking works.

**Success criteria**
- Cross-tenant fetch by ID returns 404/403; audit events created for create/update.

---

## Phase 3 — Quotes (manual price) + Convert-to-Order (idempotent)
**User stories**
1. As staff, I can create a draft Quote with manual total price.
2. As staff, I can send a quote later (status changes tracked) without calculators.
3. As staff, I can mark Quote approved/declined.
4. As staff, I can convert an approved quote to exactly one Order (double-click safe).
5. As staff, I can see quote conversion history on both Quote and Order.

**Implementation steps**
- Quote model/status + sequential quote_number.
- Convert service: transaction-like logic (Mongo session if available) + idempotency key/guard.
- Quote list/detail UI; convert button with disabled/loading.

**Deliverables**
- Quote CRUD + status transitions + conversion endpoint.

**Next actions**
- Build Orders + Order Items on the created Order.

**Success criteria**
- pytest: double convert yields same Order id; audit events for status + conversion.

---

## Phase 4 — Orders + Order Items
**User stories**
1. As staff, I can create an Order for a customer (from quote or standalone).
2. As staff, I can add 1..N Order Items with manual description + manual price.
3. As staff, I can move order status through draft→confirmed→in_production→completed/cancelled.
4. As staff, I can attach documents to an Order and specific Order Items.
5. As staff, I can view a complete order timeline (audit + emails + docs).

**Implementation steps**
- Order + OrderItem collections; OrderItem references Order.
- Status transition service with validation + audit.
- UI: Orders list/detail, inline Order Items editor.

**Deliverables**
- Orders + Order Items fully usable.

**Next actions**
- Add Work Orders creation (multiple per order).

**Success criteria**
- pytest: order create/edit/status changes write audit; tenant isolation upheld.

---

## Phase 5 — Work Orders (0..N per Order)
**User stories**
1. As staff, I can create multiple Work Orders for one Order.
2. As staff, I can include production instructions + internal notes.
3. As staff, I can set production status (not_started/in_progress/on_hold/completed).
4. As staff, I can assign a staff member optionally.
5. As staff, I can snapshot Order Items into the Work Order at creation.

**Implementation steps**
- WorkOrder model + sequential work_order_number.
- Create-from-order service that snapshots order items.
- UI: Work Orders list/detail; create from Order page.

**Deliverables**
- Work Orders module with status + assignment.

**Next actions**
- Invoicing (one per order).

**Success criteria**
- Creating multiple work orders for same order works; audit entries recorded.

---

## Phase 6 — Invoice (0..1 per Order) + Payments
**User stories**
1. As staff, I can create an Invoice from an Order once (idempotent guard).
2. As staff, I can edit invoice draft fields and add manual line items.
3. As staff, I can record multiple partial payments and see balance due.
4. As staff, invoice status updates automatically (Paid/Partially Paid/Overdue/Void).
5. As staff, I can trace Order→Invoice→Payments from any detail page.

**Implementation steps**
- Invoice model + unique index `(tenant_id, order_id)` to enforce one-per-order.
- Payment model linked to invoice; idempotency guard for payment create.
- UI: invoice detail with line items + payments panel.

**Deliverables**
- Invoices + payments working end-to-end.

**Next actions**
- Shared Documents system (real uploads).

**Success criteria**
- pytest: double invoice create returns same invoice / rejected; balance calculation correct.

---

## Phase 7 — Documents/Files + Attachments (shared)
**User stories**
1. As staff, I can upload a file once and attach it to multiple records.
2. As staff, I can mark a file internal-only or customer-visible.
3. As staff, I can download/view via signed URL only when authorized.
4. As staff, I can prevent duplicate uploads (same hash/size/name heuristic).
5. As owner, I can verify no file endpoint works without auth + tenant scope.

**Implementation steps**
- `files` collection (metadata + storage_key) + `attachments` collection (parent_type/parent_id).
- One reusable upload endpoint + validate type/size + handle failed uploads.
- Signed URL endpoint guarded by auth+tenant and attachment existence.
- UI: Documents page + attachment widgets on entities.

**Deliverables**
- App-wide file system used everywhere; no module-specific uploaders.

**Next actions**
- SendGrid email service + templates + email history.

**Success criteria**
- Automated test sweep: all file retrieval endpoints require auth and tenant isolation.

---

## Phase 8 — SendGrid Email (env wiring now; keys later) + Email Log
**User stories**
1. As staff, I can draft a custom message and send email for Quote/Invoice/Document.
2. As staff, I can use templates: Quote sent, Invoice sent, Invoice reminder, Document sent, General.
3. As staff, I can see email history per customer and per related record.
4. As staff, email failures are logged and shown clearly (missing keys, API errors).
5. As owner, I can ensure emails cannot be sent cross-tenant.

**Implementation steps**
- Call `integration_playbook_expert_v2` before coding; implement one shared `email_service.send()`.
- Env vars only; if missing, return controlled error and log `failed`.
- EmailLog model: status (queued/sent/failed/...), to/from, subject, template, related record.
- UI: compose modal + Email History page.

**Deliverables**
- Email sending wired; will fail gracefully until API key provided.

**Next actions**
- Dashboard + audit review polish.

**Success criteria**
- Without keys: app doesn’t crash; logs failures. With keys later: can send real emails.

---

## Phase 9 — Audit review + Dashboard
**User stories**
1. As staff, I can see a dashboard of active Orders, attention Work Orders, unpaid Invoices.
2. As staff, I can see recent emails and recent activity.
3. As owner, I can view audit history on each record.
4. As staff, every meaningful write produces exactly one audit entry.
5. As staff, I can navigate the full workflow quickly from dashboard links.

**Implementation steps**
- Dashboard aggregation endpoints (tenant-scoped).
- AuditEvent list component reused across entities.
- UX polish: loading/empty/error states; consistent forms.

**Deliverables**
- Dashboard page + verified audit coverage.

**Next actions**
- Full end-to-end tests and bugfix pass.

**Success criteria**
- Manual run-through matches acceptance criteria; audit feels complete.

---

## Phase 10 — Full end-to-end test pass
**User stories**
1. As an owner, I can complete the full workflow without hitting errors.
2. As staff, I can’t access other tenants’ records/files even with direct URLs.
3. As staff, double-click actions don’t create duplicates (convert/invoice/payment/email).
4. As staff, the UI navigation pages all load and basic CRUD works.
5. As owner, I can trust numbering is consistent and unique.

**Implementation steps**
- Backend pytest: auth, tenant isolation, happy-path workflow, idempotency, file auth sweep.
- Frontend smoke tests (manual or lightweight automation): all nav routes + core create/edit flows.
- Fix regressions; finalize README (env vars, run instructions).

**Deliverables**
- Passing test suite + final QA checklist.

**Next actions**
- Request SendGrid key to validate live email send; optional hardening after MVP.

**Success criteria**
- Acceptance criteria met end-to-end; no unauthenticated file access; no cross-tenant leakage.
