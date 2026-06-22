---
source_pdf: Order_Portal_Manager_Master_Build_Spec-1.pdf
source_pdf_sha256: 1220c11cd909eade18dcf6f96be6d8b73a58cb3c461e20a14ef15b2027edb277
generated_on: 2026-06-18
status: repo-ready draft
---

# ORDER_PORTAL_AGENT_BUILD_RULES

# Read This First

These are the short build rules for future agents. Short because apparently anything longer gets ignored by digital interns with commit access.

## Non-Negotiable Rules

1. Product name is **Order Portal Manager by Sign Guy AI**.
2. User-facing language is **Order Portals**, not Webstores.
3. Old `webstores` names may remain only as temporary internal compatibility.
4. Build one shared Order Portal Manager core.
5. Standalone shell and main-app add-on must use the same models/services.
6. Main app integration uses adapters, not copied logic.
7. Do not build duplicate customer, order, document, payment, report, notification, AI usage, or activity-log systems.
8. There is a global Product Template Library.
9. There is no shared global product catalog across customer portals.
10. Templates copy into each portal as editable Portal Products.
11. Editing a Portal Product must not edit the template.
12. Store owner must never see production cost.
13. Store owner must never see shop margin.
14. Buyer must never see internal cost, internal notes, or platform admin data.
15. AI may suggest; shop must approve.
16. AI must not launch a portal.
17. AI must not approve production artwork.
18. Cleaned artwork is not automatically production-ready.
19. Original artwork must always be preserved.
20. Store Launch Packet is required before launch.
21. Owner approval is required before launch unless admin override is logged.
22. Checkout requires backend validation.
23. Do not trust frontend totals.
24. All money is stored in cents.
25. Platform fees, owner share, fundraiser share, refunds, and adjustments must be ledgered.
26. Ledger entries are append-only.
27. Every major status change creates an Activity Log event.
28. First sellable release requires checkout, Stripe, orders, reports, owner portal, launch packet, and hardening.
29. Early releases are internal engineering milestones, not sellable MVPs.
30. If docs conflict, follow `ORDER_PORTAL_MANAGER_MASTER_SPEC.md` first.

## Required Launch Gates

Portal cannot launch until:

- Portal has valid owner.
- Portal has valid slug.
- Products exist.
- Active products have backend-valid pricing.
- Store Launch Packet exists.
- Owner approved packet or override logged.
- Required mockups are approved or override logged.
- Checkout/Stripe configured if checkout enabled.
- Stripe onboarding completed if direct payout enabled.
- Fundraiser/donation settings valid if enabled.
- Activity logging works.

## Forbidden Build Moves

Do not:

- Build a customer-facing advanced product designer in MVP.
- Build full inventory in MVP.
- Build full accounting in MVP.
- Build payroll in MVP.
- Build public marketplace in MVP.
- Create a global customer product catalog shared by all portals.
- Let owner edit production costs.
- Let checkout complete with frontend-only totals.
- Mutate old ledger entries instead of adding adjustments.
- Fork standalone and main app into two separate products.
