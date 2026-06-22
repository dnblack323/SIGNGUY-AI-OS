---
source_pdf: Order_Portal_Manager_Master_Build_Spec-1.pdf
source_pdf_sha256: 1220c11cd909eade18dcf6f96be6d8b73a58cb3c461e20a14ef15b2027edb277
generated_on: 2026-06-18
status: repo-ready draft
---

# ORDER_PORTAL_PUBLIC_STOREFRONT_SPEC

# Purpose

This spec defines the public buyer-facing storefront/order portal.

The public portal must be simple, clean, mobile-friendly, and focused on ordering. It should not become a full custom website builder. That path leads to a thousand settings and nobody getting paid.

## 1. Public Portal Pages

Required:

- Home/Product Listing
- Product Detail
- Cart
- Checkout
- Order Confirmation
- FAQ / Pickup & Shipping Info
- Closed Store Page
- Coming Soon Page

Optional later:

- Category page
- Search/filter
- Donation-only page
- Sponsor page
- Size guide page

## 2. Home/Product Listing

Shows:

- Portal logo.
- Banner.
- Store name.
- Store description.
- Deadline.
- Fundraiser story if enabled.
- Progress meter if enabled.
- Donation prompt if enabled.
- Product categories.
- Featured products.
- Product grid.
- Pickup/shipping summary.
- FAQ link.
- QR/share support.

## 3. Product Detail

Shows:

- Product name.
- Product images/mockups.
- Description.
- Price.
- Available sizes.
- Available colors.
- Variants/options.
- Personalization fields if enabled.
- Quantity selector.
- Add to cart.
- Pickup/shipping note.
- Deadline reminder.

Must not show:

- Production cost.
- Shop margin.
- Store owner share unless intentionally displayed for fundraiser messaging.
- Platform fee details unless legally/product-config required.

## 4. Cart

Shows:

- Items.
- Variants/options.
- Quantities.
- Line totals.
- Donation if selected.
- Discounts if enabled.
- Subtotal.
- Tax/shipping estimates if applicable.
- Total.
- Checkout button.

Backend must revalidate all totals.

## 5. Checkout

Collect:

- Buyer name.
- Email.
- Phone optional/required by shop setting.
- Pickup/shipping selection.
- Shipping address if shipping enabled.
- Notes if enabled.
- Payment info through Stripe.

## 6. Confirmation

Shows:

- Order number.
- Buyer email.
- Ordered items.
- Total.
- Pickup/shipping instructions.
- Store deadline reminder.
- Contact/support info.
- Thank-you message.
- Donation thank-you if applicable.

## 7. Store Deadline Behavior

Portal may be:

- coming_soon
- live
- closing_soon
- closed

Rules:

- Closed portals cannot accept checkout.
- Closing soon should show deadline warning.
- Coming soon should hide checkout.
- Admin preview can show closed/coming soon with preview banner.

## 8. Fundraiser Behavior

If fundraiser mode enabled:

- Show fundraiser story.
- Show goal if enabled.
- Show progress meter if enabled.
- Show donation at checkout if enabled.
- Show donation-only checkout if enabled.
- Show thank-you message after order.

If fundraiser mode disabled:

- Hide fundraiser story.
- Hide progress meter.
- Hide donation tools unless explicitly enabled separately.

## 9. Donation Behavior

Donation types:

- Add-on donation during checkout.
- Donation-only checkout.
- Suggested donation buttons.
- Custom donation amount optional.

Suggested default buttons:

- $5
- $10
- $20
- $25
- $50

## 10. Pickup / Shipping

Portal must clearly show:

- Pickup location.
- Pickup date/time if known.
- Shipping option if enabled.
- Event pickup rules if event portal.
- Customer instructions.

## 11. Public Storefront Security Rules

- Only public-safe fields are exposed.
- Backend validates every cart.
- No internal cost/margin fields are sent to browser.
- Inactive products cannot be ordered.
- Closed portals cannot checkout.
- Deleted/archived portals cannot checkout.
- Preview links must be permission-protected or clearly marked.

## 12. Acceptance Tests

- Buyer can view live portal.
- Buyer can add active product to cart.
- Buyer cannot order inactive product.
- Buyer cannot checkout closed portal.
- Manipulated frontend price is rejected.
- Donation appears only when enabled.
- Fundraiser progress appears only when enabled.
- Confirmation displays correct order details.
