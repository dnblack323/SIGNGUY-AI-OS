---
source_pdf: Order_Portal_Manager_Master_Build_Spec-1.pdf
source_pdf_sha256: 1220c11cd909eade18dcf6f96be6d8b73a58cb3c461e20a14ef15b2027edb277
generated_on: 2026-06-18
status: repo-ready draft
---

# ORDER_PORTAL_OWNER_PORTAL_SPEC

# Purpose

The Store Owner Portal gives the sign shop’s customer a professional place to complete intake, upload artwork, review the Store Launch Packet, approve launch, and track sales.

It must not feel like a random form. Random forms are how businesses cosplay as organized.

## 1. Store Owner Portal Sections

- Dashboard
- Questionnaire
- Artwork Uploads
- Store Launch Packet
- Store Preview
- Products
- Sales Progress
- Fundraiser Progress
- Donations
- Payouts
- Promotional Materials
- QR Code / Share Link
- Messages
- Reports

## 2. Dashboard

Shows:

- Store status.
- Setup progress.
- Questionnaire status.
- Approval status.
- Launch status.
- Store deadline.
- Sales total.
- Order count.
- Donation total.
- Fundraiser progress.
- Estimated payout.
- Stripe onboarding status.
- Messages from shop.
- Next steps.

## 3. Owner Permissions

Store Owner can:

- Complete questionnaire.
- Save questionnaire draft.
- Submit questionnaire.
- Upload artwork/files.
- Select known products.
- Check “open to suggestions.”
- Review product mockups.
- Review Launch Packet.
- Approve portal.
- Request changes.
- Complete Stripe onboarding.
- View QR/share links.
- Copy promotional copy.
- View sales and reports.
- View estimated payout.

Store Owner cannot:

- See production cost.
- See shop margin.
- See internal production notes.
- See internal AI prompts.
- See platform admin data.
- Change checkout totals.
- Launch portal without shop approval.
- Edit final products/pricing directly unless a future permission explicitly allows it.

## 4. Questionnaire Flow

1. Owner receives email invite.
2. Owner logs into Store Owner Portal.
3. Owner completes questionnaire.
4. Owner uploads logo/artwork.
5. Owner selects known products or checks open to suggestions.
6. Owner submits.
7. System confirms submission.
8. Shop receives notification.
9. AI setup begins.

## 5. Artwork Upload

Owner can upload:

- PNG
- JPG
- JPEG
- WEBP

Owner sees simple statuses:

- Uploaded.
- Shop reviewing.
- Cleanup recommended.
- Better file requested.
- Approved for mockup.
- Approved for production.

Owner should not see technical warnings unless rewritten in plain language.

## 6. Launch Packet Review

Owner can review:

- Store overview.
- Store description.
- Product list.
- Product mockups.
- Product selling prices.
- Store owner/fundraiser share.
- Donation settings.
- Fundraiser goal.
- Payout terms.
- Deadline.
- Pickup/shipping info.
- QR/share link.
- Promotional copy.

Owner actions:

- Approve Store.
- Request Changes.
- Message Shop.
- Complete Payout Setup.
- Copy Promo Text.
- Download QR Code.
- View Store Preview.

## 7. Change Requests

Change request should collect:

- Section needing change.
- Request details.
- Optional file upload.
- Priority/urgency optional.
- Submitted timestamp.

Change request creates:

- Portal status `changes_requested`.
- Activity log event.
- Shop notification.

## 8. Stripe Onboarding

Show Stripe onboarding only if:

- Store owner receives direct payouts, or
- Shop configuration requires owner payout setup.

Owner dashboard should show:

- Not needed.
- Needed.
- In progress.
- Completed.
- Problem requiring attention.

## 9. QR / Share Tools

Owner can access:

- Public portal link.
- QR code.
- Facebook post.
- Instagram post.
- Email announcement.
- Text message.
- Deadline reminder.
- Last-chance reminder.
- Thank-you message.
- Pickup instruction message.

## 10. Privacy Rules

Owner must never see:

- Production cost.
- Shop gross.
- Shop margin.
- Internal production notes.
- Internal template assumptions.
- Other store owners.
- Buyer payment details beyond reporting summary unless explicitly allowed.
- Platform admin settings.

## 11. Owner Report

Report shows:

- Sales total.
- Product sales.
- Donation total.
- Order count.
- Fundraiser progress.
- Estimated payout.
- Payout status.
- Deadline/close status.
- Product performance.
- Final report after close.

## 12. Owner Portal Acceptance Tests

- Owner can submit questionnaire.
- Owner can upload artwork.
- Owner can approve Launch Packet.
- Owner can request changes.
- Owner cannot see production cost.
- Owner cannot edit backend pricing.
- Owner cannot access another owner’s portal.
- Owner sees Stripe onboarding only when relevant.
- Owner sees QR/share tools only when portal is approved/live or previewable.
