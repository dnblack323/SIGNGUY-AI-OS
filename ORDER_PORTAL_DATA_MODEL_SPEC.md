---
source_pdf: Order_Portal_Manager_Master_Build_Spec-1.pdf
source_pdf_sha256: 1220c11cd909eade18dcf6f96be6d8b73a58cb3c461e20a14ef15b2027edb277
generated_on: 2026-06-18
status: repo-ready draft
---

# ORDER_PORTAL_DATA_MODEL_SPEC

# Purpose

This document defines the required data model for Order Portal Manager.

All tables/entities should support standalone-first usage while staying bridgeable into the main SignGuyAI OS.

## General Rules

- All IDs should be stable unique IDs.
- All money amounts must be stored in cents.
- All major entities should include `created_at`, `updated_at`, and soft-delete/archive fields where useful.
- Major workflow entities should connect to Activity Log.
- Store owner and buyer permissions must never expose production cost, shop margin, or internal notes.
- The model should support multi-tenant sign shop accounts.

## 1. sign_shop

Represents the software customer.

Fields:

```text
id
name
legal_name
email
phone
website
stripe_account_id
subscription_plan_id
status
settings_json
created_at
updated_at
```

## 2. sign_shop_user

Represents admins and staff.

Fields:

```text
id
sign_shop_id
name
email
role
status
last_login_at
permissions_json
created_at
updated_at
```

Roles:

- owner
- admin
- staff
- viewer

## 3. portal_owner

The sign shop’s customer.

Fields:

```text
id
sign_shop_id
customer_id nullable
contact_id nullable
owner_type
organization_name
contact_name
email
phone
address_json
notes_internal
status
created_at
updated_at
```

Main app integration:

- `customer_id` links to main Customer.
- `contact_id` links to main Contact.

## 4. order_portal

The main portal record.

Fields:

```text
id
sign_shop_id
portal_owner_id
portal_type
name
slug
purpose
status
visibility
desired_launch_date
order_deadline
pickup_shipping_preference
brand_json
fundraiser_json
donation_json
billing_json
payout_json
stripe_onboarding_status
launch_readiness_json
published_at
closed_at
created_by_user_id
created_at
updated_at
```

Portal types:

- fundraiser
- team
- b2b_reorder
- employee
- event
- promotional
- general

## 5. questionnaire_template

Fields:

```text
id
sign_shop_id nullable
portal_type
name
version
questions_json
is_global_default
active
created_at
updated_at
```

## 6. questionnaire_response

Fields:

```text
id
order_portal_id
portal_owner_id
questionnaire_template_id
status
answers_json
submitted_at
ai_summary_id nullable
created_at
updated_at
```

Statuses:

- draft
- sent
- in_progress
- submitted
- reviewed
- needs_followup

## 7. ai_summary

Fields:

```text
id
order_portal_id
source_type
source_id
summary_text
mapped_fields_json
missing_info_json
suggestions_json
status
reviewed_by_user_id
reviewed_at
ai_credit_cost
created_at
updated_at
```

## 8. product_template

Global or sign-shop default product template.

Fields:

```text
id
sign_shop_id nullable
name
product_type
category
description_template
default_images_json
size_options_json
color_options_json
variant_options_json
default_production_cost_cents
suggested_selling_price_cents
suggested_store_owner_share_cents
suggested_fundraiser_share_cents
default_platform_fee_basis_points
production_notes
decoration_method
tags_json
best_portal_types_json
mockup_support_json
placement_rules_json
active
created_at
updated_at
```

Rule:

- Templates are starting points, not store products.

## 9. portal_product

Product copied into a specific portal.

Fields:

```text
id
order_portal_id
source_product_template_id nullable
name
description
category
images_json
mockup_ids_json
variant_options_json
size_options_json
color_options_json
personalization_json
add_ons_json
production_notes_internal
production_cost_cents
selling_price_cents
store_owner_share_cents
fundraiser_share_cents
platform_fee_cents
shop_gross_before_processing_cents
active
featured
approval_status
created_at
updated_at
```

Visibility rule:

- `production_cost_cents`, `shop_gross_before_processing_cents`, and `production_notes_internal` are shop-only.

## 10. artwork_file

Fields:

```text
id
order_portal_id
portal_product_id nullable
uploaded_by_type
uploaded_by_id
original_file_url
cleaned_file_url nullable
file_type
file_size
quality_status
background_removed
transparent_png_created
production_approval_status
notes_internal
created_at
updated_at
```

Quality statuses:

- ready_for_mockups
- background_cleanup_recommended
- low_resolution_warning
- poor_contrast_warning
- needs_shop_review
- needs_customer_replacement_file
- production_ready_file_needed
- approved_for_mockups
- approved_for_production

## 11. mockup

Fields:

```text
id
order_portal_id
portal_product_id
artwork_file_id nullable
mockup_url
mockup_type
status
approved_by_user_id nullable
approved_at nullable
notes_internal
created_at
updated_at
```

Statuses:

- draft
- needs_review
- approved
- rejected
- revision_needed

## 12. launch_packet

Fields:

```text
id
order_portal_id
version
packet_json
status
sent_at
approved_at
approved_by_portal_owner_id
change_request_text
created_by_user_id
created_at
updated_at
```

Statuses:

- not_generated
- draft
- sent_for_approval
- changes_requested
- approved
- superseded

## 13. buyer_order

Fields:

```text
id
order_portal_id
buyer_email
buyer_name
buyer_phone
status
subtotal_cents
donation_cents
tax_cents
shipping_cents
discount_cents
total_cents
payment_status
stripe_payment_intent_id
stripe_checkout_session_id
main_order_id nullable
bridge_status
created_at
updated_at
```

## 14. buyer_order_item

Fields:

```text
id
buyer_order_id
portal_product_id
name_snapshot
variant_snapshot_json
quantity
unit_price_cents
line_total_cents
store_owner_share_cents
fundraiser_share_cents
platform_fee_cents
production_cost_estimate_cents
main_order_item_id nullable
created_at
updated_at
```

Snapshot fields are required because product names/prices may change later.

## 15. revenue_ledger

Immutable money/event ledger.

Fields:

```text
id
sign_shop_id
order_portal_id
buyer_order_id nullable
ledger_type
amount_cents
currency
direction
description
metadata_json
related_stripe_id nullable
financial_transaction_id nullable
posted_at
created_at
```

Ledger types:

- buyer_payment
- product_subtotal
- donation
- sales_tax
- shipping
- platform_fee
- store_owner_share
- fundraiser_share
- processing_fee
- shop_gross_estimate
- refund
- adjustment
- payout
- setup_fee
- monthly_portal_fee
- relaunch_fee

## 16. activity_log

Fields:

```text
id
sign_shop_id
order_portal_id nullable
entity_type
entity_id
event_type
old_value_json
new_value_json
actor_type
actor_id
message
metadata_json
created_at
```

Append-only.

## 17. promotion_material

Fields:

```text
id
order_portal_id
type
title
body
generated_by_ai
approved
created_at
updated_at
```

Types:

- facebook_post
- instagram_post
- email_announcement
- text_message
- deadline_reminder
- last_chance_reminder
- thank_you_message
- qr_flyer_copy
- pickup_instruction

## 18. ai_usage_event

Fields:

```text
id
sign_shop_id
order_portal_id nullable
feature
input_tokens
output_tokens
credit_cost
provider
model
status
created_at
```

## 19. capability_entitlement

Fields:

```text
id
sign_shop_id
capability
enabled
limit_json
source_plan_id
created_at
updated_at
```

Capabilities include:

- portal_management
- launch_publish
- cart_checkout
- stripe_connect
- ai_summary
- ai_product_suggestions
- ai_mockups
- background_cleanup
- owner_payouts
- main_app_bridge
