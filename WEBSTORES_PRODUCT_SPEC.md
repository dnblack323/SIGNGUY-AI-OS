---
source_pdf: Order_Portal_Manager_Master_Build_Spec-1.pdf
source_pdf_sha256: 1220c11cd909eade18dcf6f96be6d8b73a58cb3c461e20a14ef15b2027edb277
generated_on: 2026-06-18
status: repo-ready draft
---

# WEBSTORES_PRODUCT_SPEC

# Status

This file is now an entitlement and capability compatibility spec.

The controlling product is:

**Order Portal Manager by Sign Guy AI**

Old `Webstores` wording may remain temporarily in internal code, old routes, legacy docs, test data, and migration branches. User-facing product language must be **Order Portal Manager**, **Order Portals**, or **Portals**.

## 1. Purpose

This spec defines capability gates for Order Portal Manager, whether it runs as:

- Standalone product.
- SignGuyAI OS add-on.
- Future tiered subscription feature.
- Founder-plan included feature.

## 2. Naming Policy

### User-Facing

Use:

- Order Portal Manager
- Order Portal
- Portal
- Store Owner Portal
- Public Order Portal
- Buyer Checkout
- Store Launch Packet

Do not use:

- Webstores
- Webstore Builder
- Generic Online Store Builder

### Internal Compatibility

Allowed temporarily:

- `webstores`
- `/webstores`
- `webstore_id`
- old docs referencing Webstores

Any old naming must point to the Order Portal Manager spec.

## 3. Capability Gates

### 3.1 Portal Management

Controls ability to:

- Create portals.
- Edit portals.
- Duplicate portals.
- Archive portals.
- Relaunch portals.
- Manage portal statuses.
- Manage portal settings.

Required for every paid version.

### 3.2 Launch / Publish

Controls ability to:

- Generate Store Launch Packet.
- Send packet for approval.
- Mark owner approval.
- Pass launch readiness.
- Publish public portal.
- Close portal.
- Relaunch portal.

Must be gated separately from simple portal drafts.

### 3.3 Cart / Checkout

Controls ability to:

- Enable cart.
- Validate cart server-side.
- Accept buyer checkout.
- Create Buyer Orders.
- Send buyer confirmations.

First sellable release requires this capability.

### 3.4 Stripe Connect

Controls ability to:

- Connect Stripe.
- Support store owner payout onboarding.
- Track onboarding status.
- Support direct or tracked payouts.
- Track processing status and payout status.

### 3.5 AI Features

Controls ability to:

- AI questionnaire summary.
- Missing-info detection.
- Product suggestions.
- Product names.
- Product descriptions.
- Store copy.
- Fundraiser story.
- Promotional copy.
- FAQ.
- Launch checklist.
- AI credit tracking.

AI must always have human review gates.

### 3.6 Mockup / Background Cleanup

Controls ability to:

- Upload artwork.
- Preserve original artwork.
- Remove background.
- Create transparent PNG.
- Run artwork quality warnings.
- Generate product mockups.
- Approve mockups.
- Include mockups in Launch Packet.

### 3.7 Owner Payouts

Controls ability to:

- Set store owner share.
- Set fundraiser share.
- Track estimated payout.
- Track donation totals.
- Track payout status.
- Show owner payout reports.
- Hide production cost and margin.

### 3.8 Main-App Bridge

Controls ability to:

- Link portal owner to customer/contact.
- Convert Buyer Orders into canonical Orders.
- Convert portal products into Order Items.
- Link artwork to Document Library.
- Feed Revenue Ledger into Financials.
- Show Activity Logs in customer/order timelines.
- Use main app AI credits/notifications.

## 4. Plan/Tier Examples

### Founder Plan

May include all Order Portal Manager capabilities for first founder group.

### Base Add-On

Recommended:

- Portal management.
- Owner portal.
- Launch packet.
- Public portal.
- Checkout.
- Stripe.
- Orders.
- Reports.
- QR/share.
- Promotional copy.

### AI Add-On / Higher Tier

May include:

- Product suggestions.
- AI product descriptions.
- AI launch packet copy.
- Mockup generation.
- Artwork cleanup.
- Advanced promotional copy.

### Main App Add-On

Must include:

- Shared Order Portal core.
- Main app adapter.
- Customer/order/doc/financial bridges.
- No duplicate data logic.

## 5. Entitlement Enforcement

Capability gates should be enforced backend-side, not only by hiding buttons.

Example gate checks:

```text
can_create_portal
can_publish_portal
can_use_checkout
can_connect_stripe
can_use_ai_summary
can_use_ai_mockups
can_use_background_cleanup
can_view_owner_reports
can_bridge_to_main_orders
```

## 6. Compatibility Rule

If an old Webstores screen still exists, it must either:

- Redirect to Order Portal Manager.
- Display Order Portal Manager language.
- Be marked legacy/internal.
- Be removed.

Do not let old naming re-control the product. That is how docs become archaeological debris.
