---
source_pdf: Order_Portal_Manager_Master_Build_Spec-1.pdf
source_pdf_sha256: 1220c11cd909eade18dcf6f96be6d8b73a58cb3c461e20a14ef15b2027edb277
generated_on: 2026-06-18
status: repo-ready draft
---

# ORDER_PORTAL_CHECKOUT_AND_LEDGER_SPEC

# Purpose

This spec defines checkout, Stripe, buyer payments, platform fees, store owner share, shop gross, refunds, payout status, and revenue ledger behavior.

## 1. Core Rule

Checkout cannot rely on frontend totals. Ever.

Frontend can display estimates. Backend must calculate final totals from database records and entitlement/config rules.

## 2. Money Storage

All money must be stored in cents.

Use:

```text
amount_cents: integer
currency: "usd"
```

Do not store money as floating-point decimals, because apparently computers and pennies cannot be trusted in the same room.

## 3. Checkout Flow

1. Buyer opens public portal.
2. Buyer adds products to cart.
3. Buyer selects variants/options.
4. Buyer adds personalization if enabled.
5. Buyer adds donation if enabled.
6. Buyer enters contact info.
7. Backend validates cart.
8. Backend calculates totals.
9. Backend creates Stripe checkout/payment intent.
10. Buyer pays.
11. Stripe webhook confirms payment result.
12. System creates or confirms Buyer Order.
13. System creates ledger entries.
14. Buyer receives confirmation.
15. Shop sees order.
16. Store owner reports update.

## 4. Backend Validation

Validate:

- Portal is live.
- Portal is not closed.
- Product is active.
- Product belongs to portal.
- Variant exists.
- Quantity is allowed.
- Personalization fields are valid.
- Donation is allowed if donation amount exists.
- Buyer info is complete.
- Price matches backend records.
- Coupon/discount is valid if enabled.
- Shipping/pickup settings are valid.
- Tax settings are valid.
- Stripe is configured.

## 5. Buyer Order Statuses

```text
cart_started
checkout_started
payment_pending
paid
payment_failed
cancelled
refunded
partially_refunded
in_review
ready_for_production
fulfilled
closed
```

## 6. Payment Statuses

```text
not_started
pending
succeeded
failed
requires_action
cancelled
refunded
partially_refunded
disputed
```

## 7. Pricing Components

Buyer total may include:

- Product subtotal.
- Donation amount.
- Sales tax.
- Shipping.
- Discounts.
- Total.

Internal ledger also tracks:

- Platform fee.
- Store owner share.
- Fundraiser share.
- Processing fee if known.
- Production cost estimate.
- Estimated shop gross before processing.

## 8. Product-Level Formula

```text
Estimated Shop Gross Before Processing =
Selling Price - Production Cost - Store Owner Share - Platform Fee
```

Product-level payment processing should be shown as a note or estimated separately because processing is usually checkout/order-level.

## 9. Platform Fee

Default spec assumption:

```text
platform_fee = product_selling_price * 2%
```

Rules:

- Platform usage fee applies to product order subtotal unless configured otherwise.
- Platform fee should not apply to sales tax unless explicitly configured.
- Platform fee should not apply to shipping unless explicitly configured.
- Donation platform fee behavior must be configurable.

## 10. Store Owner Share / Fundraiser Share

Portal Product supports:

```text
store_owner_share_cents
fundraiser_share_cents
```

Rules:

- Store owner/fundraiser share is visible to shop.
- Owner may see payout/share summary.
- Owner must not see production cost or shop margin.
- Share may be $0 for B2B/employee/internal portals.
- Share can be per product or configured globally, but line-level snapshots must be stored.

## 11. Ledger Entry Requirements

Ledger entries are append-only.

Create entries for:

- buyer_payment
- product_subtotal
- donation
- sales_tax
- shipping
- discount
- platform_fee
- store_owner_share
- fundraiser_share
- processing_fee
- production_cost_estimate
- shop_gross_estimate
- refund
- adjustment
- payout
- setup_fee
- monthly_portal_fee
- relaunch_fee

## 12. Ledger Snapshot Example

For a $24 shirt:

```text
buyer_payment: +2400
product_subtotal: +2400
production_cost_estimate: -1150
store_owner_share: -500
platform_fee: -48
shop_gross_before_processing_estimate: +702
```

## 13. Refunds

Refund rules:

- Do not delete original ledger entries.
- Add refund ledger entries.
- Add adjustment entries if platform fee/share calculations change.
- Buyer order status updates to refunded or partially_refunded.
- Activity log records refund event.
- Reports must account for original and refund entries.

## 14. Payout Status

Payout statuses:

```text
not_required
onboarding_required
onboarding_pending
ready
pending
paid
failed
cancelled
manual_review
```

## 15. Stripe Connect / Onboarding

Required when direct store owner payouts are enabled.

Track:

- Stripe account ID.
- Onboarding status.
- Charges enabled.
- Payouts enabled.
- Requirements currently due.
- Last verified at.

## 16. Reports

Reports must be ledger-backed.

Shop report:

- Gross sales.
- Product subtotal.
- Donations.
- Order count.
- Platform fees.
- Estimated production cost.
- Estimated shop gross.
- Processing fees if available.
- Refunds.
- Store owner/fundraiser share.
- Net estimate.

Owner report:

- Sales total.
- Order count.
- Donation total.
- Fundraiser progress.
- Estimated payout.
- Payout status.
- Product performance.

Owner report must hide production cost and shop margin.

## 17. Checkout Acceptance Tests

- Checkout fails if portal is not live.
- Checkout fails if product inactive.
- Checkout fails if frontend price is manipulated.
- Checkout fails if Stripe is not configured.
- Paid order creates ledger entries.
- Refund creates adjustment entries, not mutations.
- Owner reports do not expose production cost.
- Activity log records checkout/payment/refund events.
