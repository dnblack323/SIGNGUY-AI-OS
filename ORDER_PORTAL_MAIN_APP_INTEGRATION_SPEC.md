---
source_pdf: Order_Portal_Manager_Master_Build_Spec-1.pdf
source_pdf_sha256: 1220c11cd909eade18dcf6f96be6d8b73a58cb3c461e20a14ef15b2027edb277
generated_on: 2026-06-18
status: repo-ready draft
---

# ORDER_PORTAL_MAIN_APP_INTEGRATION_SPEC

# Purpose

This document defines how **Order Portal Manager by Sign Guy AI** stays standalone-first without becoming a second disconnected product when it is later integrated into the main SignGuyAI OS.

The goal is simple: build one shared domain core, then place different shells on top of it. Not two apps duct-taped together like some tragic SaaS Frankenstein.

## 1. Controlling Rule

Build one shared **Order Portal Manager Core**.

The standalone product and the main-app add-on must use the same domain models, services, workflow statuses, activity logs, ledger rules, AI usage tracking, and permission concepts wherever possible.

## 2. Product Shape

### Shared Domain Core

Contains:

- Order Portal models.
- Store Owner models.
- Questionnaire models.
- Product Template rules.
- Portal Product rules.
- Artwork and Mockup models.
- Launch Packet workflow.
- Buyer Order models.
- Revenue Ledger.
- Portal statuses.
- Activity Log.
- AI service contracts.
- Checkout validation rules.
- Capability gates.

### Standalone Shell

Contains:

- Standalone auth.
- Standalone dashboard.
- Standalone settings.
- Standalone plan/subscription management.
- Standalone Platform Admin views.
- Standalone Sign Shop onboarding.
- Standalone public storefront routing.
- Standalone owner portal routing.

### Main App Add-On Adapter

Contains:

- SignGuyAI OS navigation integration.
- Customer/contact lookup adapter.
- Order bridge.
- Order Item bridge.
- Document Library bridge.
- Financials bridge.
- Notifications bridge.
- AI credit bridge.
- Activity timeline bridge.
- Permissions mapping.

The adapter may translate between main-app concepts and Order Portal Manager concepts. It must not duplicate business logic.

## 3. Systems That Must Not Be Duplicated

Do not create separate duplicate systems for:

- Customers.
- Contacts.
- Orders.
- Order Items.
- Documents.
- Payments.
- Reports.
- Notifications.
- AI usage.
- Activity logs.
- Product templates.
- Revenue ledger.
- Permissions.

Temporary standalone tables are allowed only where the standalone shell cannot access main-app data, and only if they map cleanly to the shared core contracts.

## 4. Integration Contracts

### 4.1 portal_owner

Standalone field:

```text
portal_owner_id
```

Main app bridge fields:

```text
customer_id
contact_id
```

Rules:

- In standalone, `portal_owner` is its own record.
- In main app, `portal_owner` may link to canonical `customer_id` and/or `contact_id`.
- The shared core must not assume every owner has a main-app customer.
- The main-app adapter should resolve owner info through customer/contact lookup.

### 4.2 portal_product

Rules:

- `portal_product` remains portal-specific.
- It is created by copying from a global Product Template or by manual product creation.
- Editing `portal_product` must not update the global template.
- `portal_product` can later map into canonical main-app `Order Item` rows when a buyer order becomes a production order.

### 4.3 buyer_order

Rules:

- `buyer_order` starts inside Order Portal Manager.
- Checkout creates validated Buyer Order records.
- In standalone mode, Buyer Orders remain portal orders.
- In main app mode, Buyer Orders can bridge into canonical `Order` and `Order Item` records.
- Bridge should be explicit and traceable.

Recommended bridge fields:

```text
buyer_order_id
main_order_id
main_order_item_ids[]
bridge_status
bridged_at
bridge_error
```

Bridge statuses:

- not_ready
- ready_to_bridge
- bridged
- bridge_failed
- bridge_skipped
- manually_reviewed

### 4.4 artwork_file

Rules:

- Standalone stores artwork in the portal file system.
- Main app can later link artwork into Document Library.
- Original artwork must be preserved.
- Cleaned artwork must be stored as a separate version.
- Production-ready approval remains a shop-controlled status.

Recommended bridge fields:

```text
artwork_file_id
document_library_file_id
original_file_id
cleaned_file_id
approval_status
```

### 4.5 revenue_ledger

Rules:

- Ledger remains the source of truth for portal fee math.
- In standalone mode, ledger powers portal reports.
- In main app mode, ledger can feed Financials.
- Ledger entries must be immutable after posting. Corrections require adjustment entries, because apparently math needs receipts.

Recommended bridge fields:

```text
ledger_entry_id
financial_transaction_id
settlement_id
payout_id
```

### 4.6 activity_log

Rules:

- Every major status change must log an event.
- In standalone, events appear in portal activity.
- In main app, events can appear in customer/order timelines.
- Activity entries should be append-only.

Event fields:

```text
activity_log_id
entity_type
entity_id
event_type
old_value
new_value
actor_type
actor_id
created_at
metadata
```

### 4.7 Auth and Permissions

Standalone auth and main-app auth are separate shells over shared domain permissions.

Shared permissions:

- platform_admin
- sign_shop_admin
- staff
- store_owner
- buyer_public

Main app adapter maps existing SignGuyAI OS roles into these shared permissions.

## 5. Shared Service Boundaries

### PortalService

- Create portal.
- Update portal.
- Duplicate portal.
- Close/relaunch portal.
- Validate launch readiness.
- Change status.
- Emit activity logs.

### QuestionnaireService

- Send questionnaire.
- Save draft.
- Submit questionnaire.
- Map responses.
- Trigger AI summary.

### AISetupService

- Summarize questionnaire.
- Detect missing info.
- Suggest products.
- Generate descriptions.
- Suggest store copy.
- Track AI credits.
- Require human review.

### ProductTemplateService

- Manage global templates.
- Copy template to portal.
- Preserve template independence.

### PortalProductService

- Create/edit portal products.
- Validate pricing.
- Validate variants.
- Control owner visibility.

### ArtworkService

- Upload originals.
- Generate cleaned versions.
- Track quality statuses.
- Generate mockup-ready images.

### MockupService

- Generate mockups.
- Store mockup assets.
- Track approval status.

### LaunchPacketService

- Generate launch packet.
- Send for owner approval.
- Record approval/change requests.
- Gate launch.

### CheckoutService

- Validate cart server-side.
- Calculate totals server-side.
- Create payment intent/session.
- Create buyer order.
- Emit ledger entries.

### LedgerService

- Record revenue entries.
- Track platform fees.
- Track store owner share.
- Track shop gross.
- Track refunds and adjustments.

### BridgeService

- Bridge buyer orders to main Order.
- Bridge artwork to Document Library.
- Bridge ledger to Financials.
- Bridge events to main timelines.

## 6. Main App Integration Rules

- Main app integration uses adapters, not copied logic.
- Standalone code must not import main-app-only services directly.
- Shared core must not depend on standalone shell.
- Shared core must not depend on main app shell.
- All bridge operations must be idempotent.
- Bridge failures must be logged and visible.
- Buyer checkout must work without main-app bridge.
- Main app bridge must never modify portal order totals after checkout without adjustment entries.
- All money values must stay in cents.
- All major status changes must log activity.
- Store owner and buyer views must never expose production cost or shop margin.

## 7. Suggested Folder Structure

```text
src/
  order-portal/
    core/
      models/
      services/
      permissions/
      workflows/
      ledger/
      ai/
      checkout/
      activity/
    standalone/
      auth/
      routes/
      dashboards/
      owner-portal/
      storefront/
      platform-admin/
    adapters/
      signguy-os/
        customer-adapter.ts
        order-adapter.ts
        document-adapter.ts
        financials-adapter.ts
        notification-adapter.ts
        activity-adapter.ts
        ai-credit-adapter.ts
```

## 8. Acceptance Tests

- Standalone shell and main-app adapter call the same shared PortalService.
- Creating a portal in standalone uses the same status workflow as creating one through main-app adapter.
- Copying a Product Template creates an independent Portal Product.
- Buyer checkout validates totals on the backend.
- Buyer order can exist without a main Order.
- Buyer order can bridge to main Order without duplicating checkout logic.
- Artwork can later link to Document Library without losing original/cleaned file history.
- Ledger entries can feed Financials without recalculating order totals in a second place.
- Activity logs are emitted for all major status changes.
