---
source_pdf: Order_Portal_Manager_Master_Build_Spec-1.pdf
source_pdf_sha256: 1220c11cd909eade18dcf6f96be6d8b73a58cb3c461e20a14ef15b2027edb277
generated_on: 2026-06-18
status: repo-ready draft
---

# ORDER_PORTAL_RELEASE_PLAN

# Purpose

This document replaces/supersedes the old `STANDALONE_WEBSTORES_MASTER_PLAN.md`.

Old user-facing **Webstores** naming is deprecated. New user-facing product language is **Order Portal Manager**, **Order Portals**, and **Portal**.

Internal `webstores` names may remain temporarily in code, routes, branches, test fixtures, and database tables while migration happens. That compatibility naming must not control future product decisions.

## 1. Release Label Rule

Early versions are internal engineering milestones, not sellable MVPs.

Do not call the product sellable until it includes:

- Checkout.
- Stripe.
- Orders.
- Reporting.
- Owner Portal.
- Store Launch Packet.
- Launch readiness gates.
- Basic hardening.

A preview that only has a wizard and pretty screens is not a sellable product. It is a nice hallucination with buttons.

## 2. Release 0.1: Documentation Control

Goal: lock the product direction.

Required:

- `ORDER_PORTAL_MANAGER_MASTER_SPEC.md`
- `ORDER_PORTAL_MAIN_APP_INTEGRATION_SPEC.md`
- `ORDER_PORTAL_RELEASE_PLAN.md`
- Updated `WEBSTORES_PRODUCT_SPEC.md`
- Updated `FINAL_SPEC_COMPLIANCE.md`
- Supporting specs:
  - Data model
  - Workflow/status
  - Checkout/ledger
  - Owner portal
  - AI
  - Public storefront
  - Agent build rules

Exit criteria:

- Every old Webstores doc points to the Order Portal spec or is marked historical/compatibility.
- PDF hash is recorded in the master spec.
- Release plan states checkout is required for first sellable version.
- Integration spec separates shared core, standalone shell, and main-app adapter.
- No doc tells agents to build a second standalone-only data model.

## 3. Release 0.2: Shared Domain Core

Goal: create core models/services without overbuilding UI.

Required:

- Portal model.
- Store Owner model.
- Questionnaire model.
- Product Template model.
- Portal Product model.
- Artwork model.
- Mockup model.
- Launch Packet model.
- Buyer Order model.
- Revenue Ledger model.
- Activity Log model.
- Permission model.
- Capability gate model.
- Portal status machine.

Exit criteria:

- Shared core exists independent of standalone shell and main app shell.
- All money fields are stored in cents.
- Product templates copy into portal products.
- Production cost is hidden from store owner/buyer permissions.
- Major status changes emit activity events.

## 4. Release 0.3: Standalone Structural Preview

Goal: create a clickable standalone preview for flow validation.

Required:

- Standalone login shell.
- Dashboard.
- Portal list.
- New Portal Wizard.
- Store Owner records.
- Portal detail tabs.
- Questionnaire preview.
- Product template selection preview.
- Launch Packet preview.
- Owner Portal preview.
- Public storefront preview.

Exit criteria:

- UI language says Order Portal Manager.
- Any remaining `webstores` code naming is internal only.
- New Store Wizard is renamed or wrapped as New Portal Wizard.
- No checkout simulation is presented as production-ready.
- Structural preview is clearly marked not production complete.

## 5. Release 0.4: AI Setup and Product Suggestions

Goal: make the intake-to-setup process useful.

Required:

- Questionnaire sending/submission.
- AI questionnaire summary.
- Missing-info detection.
- Product suggestion cards.
- AI-generated product names.
- AI-generated product descriptions.
- AI-suggested categories.
- Product selection workflow.
- Human review gates.
- AI usage/credit tracking.

Exit criteria:

- AI never directly publishes products.
- AI outputs are editable.
- Shop approval is required before launch packet.
- AI credit entries are recorded.

## 6. Release 0.5: Artwork and Mockups

Goal: support owner artwork uploads and shop review.

Required:

- Upload original artwork.
- Preserve original file.
- Background removal/cleanup workflow.
- Transparent PNG output.
- Separate cleaned file version.
- Artwork quality status.
- Mockup generation.
- Mockup approval workflow.
- Mockups included in Store Launch Packet.

Exit criteria:

- Cleaned artwork is not automatically production-ready.
- Production-ready approval is separate.
- Original and cleaned assets are traceable.

## 7. Release 0.6: Launch Packet and Owner Approval

Goal: make the store owner approval process professional.

Required:

- Launch Packet generation.
- Packet preview.
- Product list.
- Product mockups.
- Product selling prices.
- Store owner/fundraiser share.
- Donation settings.
- Payout terms.
- Promotional copy.
- QR code/share link.
- Approval actions.
- Change request workflow.

Exit criteria:

- Portal cannot launch without owner approval unless an admin override is logged.
- Production cost and shop margin are never shown to owner.
- Approval/change requests create activity logs.

## 8. Release 0.7: Checkout, Stripe, Orders, Ledger

Goal: reach real commerce capability.

Required:

- Public storefront.
- Cart.
- Server-side price validation.
- Stripe checkout.
- Buyer order creation.
- Buyer confirmation.
- Stripe onboarding support.
- Store owner payout tracking.
- Platform fee tracking.
- Revenue ledger.
- Refund adjustment entries.
- Orders dashboard.

Exit criteria:

- Checkout totals are calculated and validated backend-side.
- Buyer orders are created only after payment confirmation rules pass.
- Ledger records gross, production cost estimate, store owner share, platform fee, processing fee if known, shop gross, refunds, and adjustments.
- Money values are stored in cents.
- This is the first candidate for sellable MVP, assuming reports and hardening pass.

## 9. Release 0.8: Reports and Owner Portal Completion

Goal: make the portal useful after launch.

Required:

- Store Owner Dashboard.
- Sales progress.
- Fundraiser progress.
- Donation totals.
- Estimated payout.
- Order count.
- QR/share tools.
- Promotional copy.
- Final report.
- Shop reports.
- Export basics.

Exit criteria:

- Store owner sees clean sales/payout information.
- Shop sees portal performance and revenue.
- Reports match ledger totals.

## 10. Release 0.9: Launch Hardening

Goal: prepare for paying customers.

Required:

- Error handling.
- Empty states.
- Permission testing.
- Payment failure handling.
- Refund handling.
- Stripe webhook reliability.
- Activity audit completeness.
- Owner/buyer privacy testing.
- Basic support/admin visibility.
- Closed/relaunch flow.

Exit criteria:

- Payment/webhook flows survive retries.
- Launch readiness gate blocks incomplete portals.
- Store owner/buyer access is scoped correctly.
- Compliance doc marks preview items vs production items clearly.

## 11. Release 1.0: First Sellable Release

First sellable release must include:

- Checkout.
- Stripe.
- Buyer orders.
- Reporting.
- Owner Portal.
- Store Launch Packet.
- Launch readiness gates.
- Portal statuses.
- Activity logs.
- QR/share links.
- Promotional copy.
- AI setup assistance.
- Product templates.
- Portal-specific products.
- Owner approval.
- Basic hardening.

Do not sell a fake “MVP” missing checkout. That is a brochure with anxiety.
