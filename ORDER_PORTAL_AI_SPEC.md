---
source_pdf: Order_Portal_Manager_Master_Build_Spec-1.pdf
source_pdf_sha256: 1220c11cd909eade18dcf6f96be6d8b73a58cb3c461e20a14ef15b2027edb277
generated_on: 2026-06-18
status: repo-ready draft
---

# ORDER_PORTAL_AI_SPEC

# Purpose

This spec defines AI behavior for Order Portal Manager.

AI exists to reduce setup work, not to replace shop review. The robot can suggest things. The shop still decides, because someone has to keep the machine from selling pink hoodies to a funeral fundraiser.

## 1. AI Features

Required MVP AI features:

- Questionnaire summary.
- Missing-info detection.
- Field mapping.
- Product suggestions.
- Product names.
- Product descriptions.
- Store description.
- Fundraiser story.
- Promotional copy.
- AI Mockup Builder support.
- Artwork cleanup/background removal.
- Launch checklist.
- Store Launch Packet text.
- Credit tracking.

## 2. AI Input Sources

AI may use:

- Portal type.
- Portal name.
- Store purpose.
- Questionnaire answers.
- Uploaded artwork.
- Brand colors.
- Products requested.
- Open-to-suggestions status.
- Fundraiser/event/business context.
- Deadline.
- Store owner notes.
- Product Template Library.
- Shop settings.
- Approved AI prompt settings.

## 3. AI Output Types

AI may create:

- Summary text.
- Missing info warnings.
- Suggested setup fields.
- Store type correction suggestions.
- Suggested Product Templates.
- Draft product titles.
- Draft product descriptions.
- Suggested categories.
- Suggested bundles.
- Suggested mockup previews.
- Store description.
- Fundraiser story.
- Suggested pricing defaults.
- Suggested production cost defaults.
- Suggested store owner share.
- Suggested donation buttons.
- FAQ.
- Facebook posts.
- Email copy.
- Text message copy.
- Deadline reminders.
- Thank-you messages.
- QR flyer copy.

## 4. Human Review Requirements

AI must never automatically:

- Publish products.
- Launch portal.
- Approve mockups.
- Approve production artwork.
- Finalize pricing.
- Send Launch Packet without shop review.
- Send owner-facing copy without shop approval, unless a later explicit automation setting exists.

## 5. Missing Info Detection

AI should detect missing:

- Logo/artwork.
- Exact deadline.
- Pickup/shipping preference.
- Store owner contact.
- Approval contact.
- Product list.
- Brand colors.
- Fundraiser goal.
- Payout contact.
- Stripe onboarding need.
- Donation settings.
- Product sizes/colors.
- Required event date/location.

## 6. Field Mapping

AI should map free text into structured fields.

Example:

Owner answer:

```text
We need black hoodies and gray shirts for a wrestling fundraiser. Our colors are black and red. Deadline before the banquet.
```

Mapped output:

```text
portal_type: fundraiser
colors: black/red
products_requested: hoodie, shirt
fundraiser_subject: wrestling team
deadline_note: before banquet
missing_info: exact date, logo, pickup method
```

## 7. AI Product Suggestion Workflow

1. Owner completes questionnaire.
2. Owner selects known products or checks open to suggestions.
3. AI reviews questionnaire/artwork/template library.
4. AI creates suggested product cards.
5. Shop reviews suggestion cards.
6. Shop selects which products to add.
7. Selected templates copy into portal products.
8. Shop edits pricing, variants, images, production details.
9. Shop approves mockups and product copy.

## 8. Product Suggestion Card Fields

Each AI suggestion card should show:

- Suggested template.
- Product title.
- Description.
- Reason for suggestion.
- Suggested category.
- Suggested mockup.
- Suggested selling price.
- Production cost estimate.
- Store owner/fundraiser share.
- Platform fee.
- Estimated shop gross before processing.
- Missing info warning if needed.
- Add/skip action.

## 9. Artwork AI

AI artwork cleanup may:

- Remove background.
- Create transparent PNG.
- Crop to artwork bounds.
- Center artwork.
- Improve contrast.
- Remove border/background.
- Detect low resolution.
- Warn if blurry.
- Warn if may not print well.
- Suggest vector redraw if poor quality.
- Create mockup-ready image.

Required rules:

- Preserve original file.
- Save cleaned file separately.
- Cleaned file is not automatically production-ready.
- Production-ready approval is separate.

## 10. AI Credit Tracking

Each AI action creates an `ai_usage_event`.

Track:

- Feature.
- Portal.
- Sign shop.
- Input tokens if available.
- Output tokens if available.
- Credit cost.
- Provider/model if available.
- Status.
- Error if failed.

## 11. AI Failure Handling

If AI fails:

- Do not block manual workflow.
- Show clear error.
- Log AI failure.
- Allow retry.
- Allow manual entry.
- Do not charge credits for failed provider calls unless provider charges and policy says so.

## 12. AI Acceptance Tests

- AI summary is editable.
- AI missing-info warnings appear.
- AI product suggestions require shop approval.
- AI outputs do not publish directly.
- AI credit entry is created.
- Production cost is not shown to store owner.
- AI-generated mockup requires approval.
