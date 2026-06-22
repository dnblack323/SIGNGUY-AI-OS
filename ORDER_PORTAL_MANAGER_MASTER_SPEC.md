---
source_pdf: Order_Portal_Manager_Master_Build_Spec-1.pdf
source_pdf_sha256: 1220c11cd909eade18dcf6f96be6d8b73a58cb3c461e20a14ef15b2027edb277
generated_on: 2026-06-18
status: repo-ready draft
---

# ORDER_PORTAL_MANAGER_MASTER_SPEC

# Order Portal Manager by Sign Guy AI
## Master Product Specification

## 1. Purpose

This document is the controlling repo-native product specification for **Order Portal Manager by Sign Guy AI**.

This supersedes outdated user-facing **Webstores** language. Existing internal code, routes, tables, or folders may temporarily use `webstores` naming during migration, but all product, UI, sales, help, and future implementation language must use **Order Portal Manager**, **Order Portal**, or **Portal**.

## 2. Product Positioning

**Order Portal Manager by Sign Guy AI** is AI-assisted online order portal software for sign shops that want to create customer ordering portals faster, sell a new managed service, and keep orders, payouts, owner approvals, and reports organized.

It is not a generic webstore builder. Humanity already invented enough vague store builders to make a landfill. This product is a managed order portal system for sign shops.

The system helps sign shops create portals for:

- Fundraisers
- Teams
- Businesses and B2B reorder programs
- Employee stores
- Events
- Promotional merchandise programs
- General custom product order portals

## 3. Core Product Promise

A sign shop should be able to tell its customer:

1. We create your online order portal.
2. You answer a simple questionnaire.
3. You upload logos, artwork, and notes.
4. AI helps prepare store copy, product descriptions, mockups, and promotional material.
5. We review and polish everything.
6. You review a complete Store Launch Packet.
7. You approve before launch.
8. You share a link and QR code.
9. Buyers order online.
10. You track progress in your owner portal.

## 4. Primary Users

### 4.1 Platform Admin

The Platform Admin is Sign Guy AI or the software owner.

Platform Admin can:

- Manage sign shop accounts.
- Manage plans, subscriptions, and platform fees.
- View total processed order volume.
- View platform revenue.
- View AI usage.
- View future SMS/MMS usage.
- Manage global product templates.
- Manage default pricing templates.
- Manage AI prompts and system settings.
- View support issues, analytics, and reports.
- Manage onboarding offers and platform-wide defaults.

### 4.2 Sign Shop Admin

The Sign Shop Admin is the paying software customer and main operator.

Sign Shop Admin can:

- Create order portals for customers.
- Manage store owners.
- Send questionnaires.
- Review AI summaries.
- Select product templates.
- Add and edit portal products.
- Manage product pricing, production cost, store owner share, and platform fees.
- Upload artwork.
- Run artwork cleanup and mockup generation.
- Approve mockups.
- Configure fees, payouts, donation rules, and deadlines.
- Generate Store Launch Packets.
- Send portals for approval.
- Launch portals.
- Manage buyer orders.
- View reports.
- Track store owner billing and payouts.
- Connect Stripe.
- Charge store owners setup fees and monthly portal fees.
- Duplicate, relaunch, close, and archive portals.
- Manage staff permissions.

### 4.3 Staff

Staff are optional lower-permission users controlled by the Sign Shop Admin.

Staff may help with:

- Portal creation.
- Questionnaire review.
- Artwork uploads.
- Artwork cleanup.
- Mockups.
- Product setup.
- Descriptions.
- Launch Packets.
- Buyer orders.
- Reports.
- Store owner communication.

### 4.4 Store Owner

The Store Owner is the sign shop's customer.

Examples:

- Booster club
- School
- Business
- Sports team
- Race driver
- Event organizer
- Church
- Fire department
- Promotional customer
- Employee program manager
- Nonprofit
- Community group
- Club

Store Owner can:

- Log into the Store Owner Portal.
- Complete the questionnaire.
- Upload logos, artwork, and files.
- Select known products.
- Mark themselves open to product suggestions.
- Review the Store Launch Packet.
- Review product mockups.
- Request changes.
- Approve the portal.
- Complete Stripe payout onboarding if needed.
- View store setup progress.
- View live sales, fundraiser progress, donations, estimated payout, deadline, QR code, share link, promotional copy, and final reports.

Store Owner must never see:

- Sign shop production cost.
- Shop product margin.
- Internal shop notes.
- Internal template cost assumptions.
- Platform admin data.

### 4.5 Buyer

Buyer can:

- View the public portal.
- View products.
- Select options and variants.
- Add personalization if enabled.
- Add donations if fundraiser mode is enabled.
- Use donation-only checkout if enabled.
- Checkout online.
- Receive confirmation.
- View pickup or shipping instructions.

## 5. High-Level System Structure

Core entities:

- Platform Admin
- Sign Shop
- Sign Shop User
- Store Owner
- Order Portal
- Questionnaire
- Questionnaire Response
- AI Summary
- Product Template
- Portal Product
- Artwork File
- Mockup
- Store Launch Packet
- Buyer Order
- Payment
- Payout
- Store Owner Billing
- Platform Fee
- Revenue Ledger
- Report
- Promotion Material
- Activity Log

## 6. Non-Negotiable Product Catalog Rule

There must be a global **Product Template Library**.

There must not be one shared global customer-facing product catalog across all portals.

Each portal owns its own selected products.

When a template is selected, it is copied into that portal as an editable **Portal Product**. Editing a Portal Product must not change the original global template.

## 7. Main Navigation

Standalone app navigation:

- Dashboard
- Order Portals
- Store Owners
- Products / Templates
- Orders
- Reports
- Billing & Payouts
- AI Tools
- Settings

## 8. Order Portal Detail Tabs

Each portal detail page should include:

- Overview
- Questionnaire
- AI Setup
- AI Product Suggestions
- Artwork / Mockups
- Products
- Branding
- Store Launch Packet
- Orders
- Store Owner Portal
- Billing & Payouts
- Promotions
- Reports
- Settings
- Activity Log

## 9. Dashboard Requirements

Dashboard cards:

- Active portals
- Draft portals
- Waiting on questionnaire
- Waiting on approval
- Live portals
- Closing soon
- Total portal sales
- Store owner payouts pending
- Setup fees collected
- Monthly store fees collected
- Orders needing review
- AI tasks pending
- Stripe onboarding incomplete
- Recent activity

Action Required should show:

- Store owner has not completed questionnaire.
- Missing logo.
- Missing deadline.
- Store owner checked “open to suggestions.”
- AI product suggestions ready.
- Artwork cleanup needed.
- Mockups need approval.
- Store Launch Packet not generated.
- Store Launch Packet not approved.
- Stripe onboarding incomplete.
- Store closing soon.
- New orders received.
- Failed store owner payment.
- Payout issue.
- Buyer issue.
- AI missing-information warning.

Quick actions:

- New Order Portal
- Send Questionnaire
- Create Product Template
- Upload Artwork
- Generate Mockups
- Generate Store Launch Packet
- View Orders
- View Reports
- Open Billing

## 10. Required Workflow

Final workflow:

1. Sign shop creates new Order Portal.
2. Sign shop selects portal type.
3. Sign shop adds or selects store owner.
4. System sends questionnaire.
5. Store owner logs into Store Owner Portal.
6. Store owner answers basic questions.
7. Store owner uploads logo/artwork.
8. Store owner selects known products or checks “open to suggestions.”
9. Store owner submits questionnaire.
10. AI summarizes answers.
11. AI detects missing information.
12. AI suggests product templates.
13. AI creates draft product names, descriptions, and mockup previews.
14. AI shows estimated production cost, selling price, store owner share, platform fee, and estimated shop gross.
15. Sign shop reviews AI Product Suggestions.
16. Sign shop checks which products to include.
17. Sign shop edits pricing, variants, images, personalization, and production details.
18. Sign shop approves mockups.
19. Sign shop configures billing, payouts, deadlines, fundraiser goals, and donation settings.
20. Sign shop generates Store Launch Packet.
21. Store owner reviews the packet.
22. Store owner approves or requests changes.
23. Store owner completes Stripe payout onboarding if needed.
24. Sign shop launches the portal.
25. Store owner shares link, QR code, and promotional copy.
26. Buyers order online.
27. Store owner tracks progress.
28. Sign shop manages orders and production.
29. System tracks fees, payouts, reports, platform revenue, and relaunch options.

## 11. Order Portal Creation Wizard

### Step 1: Choose Portal Type

Portal types:

- Fundraiser Portal
- Team Store
- Business / B2B Reorder Portal
- Employee Store
- Event Store
- Promotional Store
- General Order Portal

Each type loads:

- Default questionnaire.
- Suggested product templates.
- Default pricing suggestions.
- Fee presets.
- Fundraiser/donation rules.
- Promotion templates.
- Store Launch Packet sections.
- Default timeline fields.

### Step 2: Select or Create Store Owner

Fields:

- Store owner name
- Organization/business name
- Main contact name
- Email
- Phone
- Address if needed
- Store owner type
- Notes

### Step 3: Initial Portal Info

Fields:

- Portal name
- Portal purpose
- Desired launch date
- Order deadline
- Pickup/shipping preference
- Portal visibility
- Portal slug
- Internal notes

### Step 4: Send Questionnaire

Questionnaire is emailed and also available in the Store Owner Portal. Store owner must log in to complete it.

### Step 5: AI Setup Review

AI summarizes answers and maps answers into setup fields.

### Step 6: AI Product Suggestions

AI suggests products based on portal type, questionnaire answers, uploaded artwork, and Product Template Library.

### Step 7: Product Selection

Sign shop reviews product suggestion cards and selects products.

### Step 8: Artwork and Mockups

Shop reviews artwork, runs cleanup/background removal if needed, and generates or approves mockups.

### Step 9: Branding

Shop sets:

- Logo
- Banner
- Color scheme
- Store description
- Fundraiser story if applicable
- Category layout

### Step 10: Billing & Payout Rules

Shop configures:

- Store owner setup fee
- Monthly active portal fee if any
- Relaunch fee if any
- Product pricing
- Production cost
- Store owner payout rules
- Fundraiser share rules
- Donation settings
- Stripe onboarding requirement
- Platform usage fee display

### Step 11: Generate Store Launch Packet

System creates launch packet.

### Step 12: Send for Approval

Store owner approves or requests changes.

### Step 13: Launch Portal

Portal launches only after launch readiness gates pass.

## 12. Portal Types

### Fundraiser Portal

Used when a group raises money through product sales and/or donations.

Required behavior:

- Fundraiser story.
- Fundraiser goal.
- Progress meter.
- Donation at checkout.
- Donation-only checkout option.
- Store owner payout tracking.
- Fundraiser share per product.
- Deadline required.
- Store owner approval required.
- Stripe onboarding recommended/required if direct payout is enabled.
- Store Launch Packet required.

### Team Store

Used for sports teams, school groups, booster clubs, leagues, clubs, and organization apparel.

Behavior:

- Team logo/colors.
- Spirit wear products.
- Deadline.
- Pickup instructions.
- Optional fundraiser share.
- Optional progress meter if fundraiser enabled.
- Product bundles.
- Store Launch Packet required.

### Business / B2B Reorder Portal

Used for companies needing ongoing ordering.

Behavior:

- Approved product list.
- Employee uniforms/workwear.
- Decals, signs, banners, reorder items.
- Ongoing portal.
- Monthly active portal fee option.
- No donation tools by default.
- No fundraiser progress meter by default.
- Store Launch Packet required.

### Employee Store

Used for businesses or organizations ordering employee apparel.

Behavior:

- Staff apparel and uniform products.
- Optional department categories.
- Optional allowance tracking later.
- Ongoing portal.
- Monthly active portal fee option.
- No donation tools by default.
- Store Launch Packet required.

### Event Store

Used for races, tournaments, festivals, reunions, banquets, car shows, and local events.

Behavior:

- Event dates.
- Order deadline.
- Pickup location.
- Event merchandise.
- Staff products.
- Sponsor products.
- Auto-close date.
- Late order settings.
- Optional donation only if event is fundraiser.
- Store Launch Packet required.

### Promotional Store

Used for race teams, creators, local brands, community figures, and promotional merch programs.

Behavior:

- Store owner payout options.
- Product sales reporting.
- Ongoing or limited-time store.
- Promotional social/email/text copy.
- Optional monthly active portal fee.
- Optional revenue share.
- Store Launch Packet required.

### General Order Portal

Flexible portal for custom online ordering.

Behavior:

- Products chosen by shop.
- Optional deadline.
- Optional owner portal.
- Optional billing.
- No fundraiser tools by default unless enabled.
- Store Launch Packet required.

## 13. Questionnaire System

Questionnaire must feel like intake, not like forcing the owner to build the store themselves.

Each portal type has its own questionnaire template. Questionnaires can be emailed, opened from Owner Portal, saved as drafts, submitted, reviewed by shop, and summarized by AI.

Base questionnaire fields:

- Portal/store name
- Organization/business name
- Main contact
- Email
- Phone
- Logo upload
- Artwork upload
- Brand colors
- Store purpose
- Products wanted
- Deadline
- Pickup/shipping preference
- Special instructions
- Approval contact
- Notes

Product section:

- T-shirts
- Hoodies
- Sweatshirts
- Hats
- Jackets
- Tank tops
- Polos
- Work shirts
- Safety shirts
- Posters
- Banners
- Yard signs
- Decals
- Stickers
- Product bundles
- Not sure yet
- “I’m open to product suggestions based on my store type, logo, and audience.”

## 14. AI Requirements

AI may:

- Summarize questionnaire answers.
- Detect missing information.
- Map answers into setup fields.
- Suggest portal type corrections.
- Suggest products.
- Suggest bundles.
- Create store descriptions.
- Create fundraiser stories.
- Create product descriptions and names.
- Create categories.
- Create FAQ.
- Create promotional copy.
- Create deadline reminders.
- Create QR flyer copy.
- Generate launch checklist.
- Generate Store Launch Packet text.

AI must not:

- Publish products without shop review.
- Approve production artwork.
- Launch a portal.
- Finalize pricing without shop approval.
- Expose internal cost/margin to store owners.

## 15. AI Mockup Builder

Feature name: **AI Mockup Builder**

Sub-features:

- Artwork Upload
- Background Remover
- Transparent PNG Creator
- Artwork Quality Check
- Product Mockup Generator
- AI Product Suggestions
- Mockup Approval
- Store Launch Packet Mockups

Supported MVP uploads:

- PNG
- JPG
- JPEG
- WEBP

Original files must always be preserved. Cleaned files must be stored as separate versions. Cleaned artwork does not mean production-ready artwork. Production-ready approval is a separate sign-shop-controlled status.

## 16. Product Management

Portal Products support:

- Product name
- Description
- Category
- Multiple images
- Mockups
- Variants
- Sizes
- Colors
- Style options
- Personalization
- Add-ons
- Production notes
- Production cost
- Selling price
- Store owner share
- Fundraiser share
- Shop margin
- Platform usage fee
- Inventory optional later
- Active/inactive
- Featured status

## 17. Store Branding

Each portal supports:

- Store logo
- Custom banner
- Color scheme
- Store description
- Fundraiser story if applicable
- Product categories
- Featured products
- FAQ
- Pickup/shipping instructions
- Store slug
- Share link
- QR code

AI can suggest colors, banner text, store copy, FAQ, and category names.

## 18. Store Launch Packet

The Store Launch Packet is a major required feature.

It must include:

- Store overview.
- Store owner/contact details.
- Store purpose.
- Store description.
- Fundraiser story if applicable.
- Product list.
- Product mockups.
- Product pricing visible to owner.
- Store owner share/fundraiser share.
- Donation settings if enabled.
- Fundraiser goal and progress meter setup.
- Payout schedule and method.
- Stripe onboarding status.
- Estimated store owner earnings.
- Checkout/payment notes.
- Promotion materials.
- QR code/share link.
- Owner instructions.
- Approval actions.

Store Owner can:

- Approve Store.
- Request Changes.
- Message Shop.
- Complete Payout Setup.
- Copy Promo Text.
- Download QR Code.
- View Store Preview.

Sign Shop can:

- Generate Launch Packet.
- Preview Packet.
- Regenerate AI Copy.
- Make Edits.
- Send Packet for Approval.
- Approve and Launch Store.

## 19. Public Buyer Storefront

Buyer-facing portal should be clean, simple, mobile-friendly, and conversion-focused.

Required:

- Store header/branding.
- Product listing.
- Product detail.
- Variant selection.
- Personalization if enabled.
- Cart.
- Checkout.
- Donation prompts if enabled.
- Pickup/shipping instructions.
- Confirmation.
- Store deadline and close behavior.
- FAQ.

## 20. Stripe, Checkout, Billing, and Ledger

The system must support:

- Buyer checkout.
- Stripe payments.
- Stripe Connect/onboarding where store owner direct payout is enabled.
- Platform usage fee tracking.
- Store owner share.
- Fundraiser share.
- Shop gross.
- Payment processing notes.
- Payout status.
- Refund handling.
- Revenue ledger entries.
- Reports.

Money must be stored in cents.

## 21. Required MVP Features

MVP must include:

1. Sign shop account/login.
2. Platform admin.
3. Order portal creation wizard.
4. Portal type selection.
5. Store owner records.
6. Store Owner Portal login.
7. Questionnaire sending and submission.
8. Artwork upload.
9. AI artwork cleanup/background removal.
10. AI questionnaire summary.
11. AI missing info detection.
12. Product Template Library.
13. Product selection from templates.
14. AI product suggestions.
15. AI product descriptions.
16. AI Mockup Builder.
17. Mockup approval workflow.
18. Store branding.
19. Product images and variants.
20. Store Launch Packet.
21. Store owner approval flow.
22. Public store page.
23. Buyer checkout.
24. Fundraiser progress meter.
25. Donation tools for fundraiser stores.
26. Stripe onboarding support.
27. Store owner billing settings.
28. Platform usage fee tracking.
29. Orders.
30. Reports.
31. QR code.
32. Promotional copy generation.
33. Activity log.
34. Portal statuses.
35. Basic dashboard.
36. Product pricing defaults with production cost.
37. Store Launch Packet pricing summary.

## 22. Features to Delay

Do not overbuild these in MVP:

- Full inventory.
- Full CRM.
- Full production management.
- Payroll.
- Full accounting replacement.
- Complex multi-location permissions.
- Unlimited SMS/MMS.
- Advanced tax automation beyond Stripe/basic checkout needs.
- Complex custom website builder.
- Too many pricing plans.
- Overcomplicated theme builder.
- Public marketplace.
- Global product catalog across all stores.
- Fully automated production-file approval.
- Customer-facing advanced product builder.

## 23. Pricing Formula

Production cost definition:

> Estimated cost to produce one finished item before payment processing, platform fees, shipping, tax, and store owner payout.

Estimated shop gross before processing:

```text
Estimated Shop Gross Before Processing =
Selling Price - Production Cost - Store Owner Share - Platform Fee
```

Example:

```text
Selling price: $24.00
Production cost: $11.50
Store owner share: $5.00
Platform fee at 2%: $0.48
Estimated shop gross before processing: $7.02
```

Payment processing is separate because it is usually calculated at the checkout/order level.

## 24. Business Rules

- Each portal belongs to one sign shop.
- Each portal has one store owner.
- Each portal has its own products.
- Product templates can be reused, but portal products are copied into the portal and editable.
- Store owner logs into portal to complete questionnaire.
- Store owner can upload artwork.
- Store owner can select known products.
- Store owner can check “open to suggestions.”
- AI can suggest products based on questionnaire, store type, templates, and artwork.
- AI can generate draft mockups.
- Sign shop must review all suggested products and mockups before adding them to the final portal.
- Store owner reviews and approves the Store Launch Packet before launch.
- Fundraiser donation tools only appear when fundraiser mode is enabled.
- Progress meter only appears when fundraiser/progress mode is enabled.
- Store owner payout onboarding is required if store owner receives direct payouts.
- Platform usage fee applies only to product order subtotal unless explicitly configured otherwise.
- All major status changes must create Activity Log entries.
- Checkout must never rely only on frontend pricing.
- Production cost and shop margin must never be exposed to store owners or buyers.

## 25. Build Phases

### Phase 1: Documentation and Naming Control

- Create these repo-native docs.
- Mark old Webstores docs as compatibility/historical.
- Lock Order Portal Manager as controlling language.
- Keep internal route compatibility during migration.

### Phase 2: Shared Domain Core

- Models.
- Services.
- Permissions.
- Activity logging.
- Ledger.
- AI usage tracking.
- Status machine.

### Phase 3: Standalone Shell MVP

- Standalone auth.
- Dashboard.
- Portal wizard.
- Owner portal.
- Storefront.
- Checkout.
- Stripe.
- Reports.

### Phase 4: Launch Hardening

- Backend validation.
- Error handling.
- Audit logs.
- Payment reliability.
- Owner approvals.
- Refund handling.
- Close/relaunch flows.

### Phase 5: Main App Integration Adapter

- Customer bridge.
- Order bridge.
- Document Library bridge.
- Financials bridge.
- Notification bridge.
- Activity timeline bridge.
- AI credit bridge.

## 26. Marketing Language

Use this language:

**Order Portal Manager by Sign Guy AI helps sign shops create AI-assisted online order portals for fundraisers, teams, businesses, employee stores, events, promotional campaigns, and custom product programs.**

Supporting lines:

- From customer answers to a professional order portal in minutes.
- Create the portal. Sell the service. Let the orders come in.
- One customer portal setup can cover your monthly software cost.
- Give every store owner a complete Store Launch Packet before the portal goes live.
- Stop chasing paper forms, group messages, spreadsheets, and half-baked “can you just make a store?” chaos.
