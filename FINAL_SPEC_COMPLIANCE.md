---
source_pdf: Order_Portal_Manager_Master_Build_Spec-1.pdf
source_pdf_sha256: 1220c11cd909eade18dcf6f96be6d8b73a58cb3c461e20a14ef15b2027edb277
generated_on: 2026-06-18
status: repo-ready draft
---

# FINAL_SPEC_COMPLIANCE

# Current Compliance Status

This document reflects the current product direction and repo reality for **Order Portal Manager by Sign Guy AI**.

## 1. Controlling Product Direction

The controlling product direction is now:

**Order Portal Manager by Sign Guy AI**

This replaces old user-facing **Webstores** positioning.

## 2. Current Repo Reality

The current preview/code may still use Webstores naming in:

- UI labels.
- Routes.
- File names.
- Database fields.
- Test data.
- Old docs.
- Wizard labels.
- Navigation labels.

This is expected during migration, but it must not control future build decisions.

## 3. Required Terminology Migration

User-facing:

- Webstores → Order Portals
- Webstore Manager → Order Portal Manager
- New Store Wizard → New Portal Wizard
- Store Setup → Portal Setup
- Store Owner → Store Owner remains acceptable because the portal owner may still own the customer-facing store/campaign
- Public Storefront → Public Order Portal or Public Storefront, depending on buyer UI context

## 4. Preview Status

Current app is a structural preview only unless all sellable release requirements pass.

A structural preview may include:

- Dashboard layout.
- Navigation.
- Portal list.
- Wizard shell.
- Mock data.
- Placeholder owner portal.
- Placeholder public storefront.
- Placeholder reports.

A structural preview is not production complete.

## 5. Production-Complete Requirements

First sellable release must include:

- Checkout.
- Stripe.
- Buyer Orders.
- Store Owner Portal.
- Store Launch Packet.
- Owner approval.
- Product templates.
- Portal-specific products.
- AI setup assistance.
- Mockup/artwork workflow.
- Reporting.
- Revenue Ledger.
- Activity Logs.
- Launch readiness gates.
- Backend validation.
- Hardening.

## 6. Compliance Warnings

### Warning 1: Webstores Naming Still Present

Status: expected during migration.

Fix:

- Update docs first.
- Update UI second.
- Update routes/data names carefully.
- Maintain compatibility redirects if needed.

### Warning 2: New Store Wizard Exists As Preview

Status: acceptable only as a preview.

Fix:

- Rename conceptually to New Portal Wizard.
- Ensure wizard follows portal workflow:
  - Choose type.
  - Select owner.
  - Initial portal info.
  - Send questionnaire.
  - AI setup review.
  - Product suggestions.
  - Product selection.
  - Artwork/mockups.
  - Branding.
  - Billing/payout rules.
  - Launch Packet.
  - Owner approval.
  - Launch.

### Warning 3: Checkout Missing Means Not Sellable

If checkout, Stripe, orders, reporting, owner portal, and hardening are missing, the product is not sellable.

Call it an internal milestone, not MVP.

### Warning 4: Duplicate Standalone/Main-App Logic Risk

Do not build a standalone-only data model that later has to be thrown away.

Fix:

- Use shared core.
- Use standalone shell.
- Use main-app adapter.
- Do not copy business logic.

## 7. Required Documentation Compliance Checklist

- `ORDER_PORTAL_MANAGER_MASTER_SPEC.md` exists.
- PDF source hash is recorded.
- `ORDER_PORTAL_MAIN_APP_INTEGRATION_SPEC.md` exists.
- `ORDER_PORTAL_RELEASE_PLAN.md` supersedes standalone webstores plan.
- `WEBSTORES_PRODUCT_SPEC.md` is updated as capability/entitlement spec.
- Old Webstores docs are marked compatibility/historical.
- First sellable release requires checkout.
- Integration spec separates shared core, standalone shell, and main-app adapter.
- No doc tells agents to build a second standalone-only data model.
- Agent build rules exist and are short enough to actually be obeyed by agents, a miracle if it happens.

## 8. Final Compliance Rule

When a conflict exists, priority order is:

1. `ORDER_PORTAL_MANAGER_MASTER_SPEC.md`
2. `ORDER_PORTAL_MAIN_APP_INTEGRATION_SPEC.md`
3. `ORDER_PORTAL_RELEASE_PLAN.md`
4. Supporting Order Portal specs
5. Compatibility Webstores docs
6. Historical Webstores docs
