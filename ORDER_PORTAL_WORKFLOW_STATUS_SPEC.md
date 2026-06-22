---
source_pdf: Order_Portal_Manager_Master_Build_Spec-1.pdf
source_pdf_sha256: 1220c11cd909eade18dcf6f96be6d8b73a58cb3c461e20a14ef15b2027edb277
generated_on: 2026-06-18
status: repo-ready draft
---

# ORDER_PORTAL_WORKFLOW_STATUS_SPEC

# Purpose

This spec defines statuses, transitions, launch gates, and activity log requirements for Order Portal Manager.

## 1. Portal Statuses

Core statuses:

```text
draft
questionnaire_sent
waiting_on_owner
questionnaire_submitted
ai_review_ready
setup_in_review
products_selected
mockups_in_review
launch_packet_draft
waiting_on_owner_approval
changes_requested
approved
stripe_pending
ready_to_launch
live
closing_soon
closed
archived
relaunch_pending
```

## 2. Status Meanings

### draft

Portal has been created but questionnaire has not been sent.

### questionnaire_sent

Questionnaire invitation has been sent.

### waiting_on_owner

Owner has not completed required intake.

### questionnaire_submitted

Owner submitted questionnaire and artwork/products info.

### ai_review_ready

AI summary, missing-info detection, or product suggestions are ready.

### setup_in_review

Shop is reviewing AI output, products, branding, artwork, or billing.

### products_selected

Shop has selected at least one portal product.

### mockups_in_review

Mockups exist but are not fully approved.

### launch_packet_draft

Launch Packet exists but has not been sent.

### waiting_on_owner_approval

Launch Packet has been sent to owner.

### changes_requested

Owner requested changes.

### approved

Owner approved packet.

### stripe_pending

Stripe onboarding or payout setup is required but incomplete.

### ready_to_launch

All launch gates pass.

### live

Public portal is live.

### closing_soon

Portal is live and deadline is near.

### closed

Portal no longer accepts orders.

### archived

Portal is hidden from active work.

### relaunch_pending

Closed or archived portal is being prepared for relaunch.

## 3. Transition Rules

Allowed common transitions:

```text
draft -> questionnaire_sent
questionnaire_sent -> waiting_on_owner
waiting_on_owner -> questionnaire_submitted
questionnaire_submitted -> ai_review_ready
ai_review_ready -> setup_in_review
setup_in_review -> products_selected
products_selected -> mockups_in_review
mockups_in_review -> launch_packet_draft
launch_packet_draft -> waiting_on_owner_approval
waiting_on_owner_approval -> changes_requested
changes_requested -> setup_in_review
waiting_on_owner_approval -> approved
approved -> stripe_pending
approved -> ready_to_launch
stripe_pending -> ready_to_launch
ready_to_launch -> live
live -> closing_soon
closing_soon -> closed
live -> closed
closed -> archived
closed -> relaunch_pending
archived -> relaunch_pending
relaunch_pending -> setup_in_review
```

## 4. Who Can Change Status

### Platform Admin

Can change any status for support/admin reasons. Must log reason.

### Sign Shop Admin

Can change all normal workflow statuses for their own portals.

### Staff

Can change setup statuses if permission allows.

Cannot:

- Force launch without permission.
- Override owner approval unless granted.
- Edit billing/payout settings unless granted.

### Store Owner

Can only trigger:

- questionnaire submitted
- changes requested
- approved
- Stripe onboarding completed event

### Buyer

Can trigger buyer order/payment events only.

## 5. Launch Readiness Gates

Portal cannot become `live` unless:

- Portal has a valid name.
- Portal has valid slug.
- Portal has one portal owner.
- Public visibility setting is valid.
- Store owner questionnaire submitted or admin override logged.
- Required artwork status is acceptable for mockups.
- Products exist.
- Active products have valid prices.
- Prices pass backend validation.
- Store Launch Packet generated.
- Store Launch Packet approved by owner or admin override logged.
- Required mockups approved or admin override logged.
- Fundraiser settings valid if fundraiser mode enabled.
- Donation settings valid if donation mode enabled.
- Stripe/checkout configured.
- Stripe onboarding complete if direct payout enabled.
- Deadline/close behavior configured if required.
- QR/share link generated.
- Activity log active.

## 6. Activity Log Events

Log every major event:

- portal_created
- portal_updated
- status_changed
- questionnaire_sent
- questionnaire_started
- questionnaire_submitted
- artwork_uploaded
- artwork_cleanup_generated
- artwork_quality_warning_created
- ai_summary_generated
- ai_missing_info_detected
- ai_product_suggestions_generated
- product_template_copied
- portal_product_created
- portal_product_updated
- mockup_generated
- mockup_approved
- launch_packet_generated
- launch_packet_sent
- launch_packet_approved
- launch_packet_changes_requested
- stripe_onboarding_started
- stripe_onboarding_completed
- portal_launched
- portal_closed
- portal_relaunched
- buyer_order_created
- payment_succeeded
- payment_failed
- refund_created
- payout_status_changed
- ledger_entry_created
- report_generated
- admin_override_used

## 7. Activity Log Payload

Every log entry should include:

```text
entity_type
entity_id
event_type
old_value
new_value
actor_type
actor_id
message
metadata
created_at
```

## 8. Admin Overrides

Admin override is allowed only for:

- Skipping questionnaire.
- Skipping owner approval.
- Skipping mockup approval.
- Launching with Stripe incomplete when checkout disabled.
- Closing/relaunching manually.

Admin override requires:

- Actor.
- Reason.
- Timestamp.
- Affected gate.
- Activity log event.

## 9. Status Display Rules

Store owner sees simplified statuses:

- Setup started.
- Waiting on your questionnaire.
- Shop reviewing.
- Products/mockups being prepared.
- Ready for your approval.
- Changes requested.
- Approved.
- Payout setup needed.
- Ready to launch.
- Live.
- Closed.

Buyer sees only:

- Open.
- Closing soon.
- Closed.
- Coming soon.
