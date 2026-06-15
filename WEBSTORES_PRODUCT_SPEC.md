# Webstores Product And Entitlement Specification

The controlling protected source is `SignGuy_AI_Webstore_Master_Rebuild_Spec.pdf`. Standalone Webstores is the first commercial build priority. See `STANDALONE_WEBSTORES_MASTER_PLAN.md`.

## Product Modes

### Full SignGuyAI App

Webstores management is always available from the main SignGuyAI app. A tenant can create stores, complete setup, manage products, collect owner information, review approvals, prepare branding, and inspect reports without purchasing commerce capabilities.

### Webstores Standalone

Customers who only want Webstores receive a focused Webstores-only shell. It uses the same Webstores domain and records as the full app. It must not fork or duplicate stores, products, owners, forms, documents, notifications, reports, payments, orders, or AI usage.

Preview route: `/?mode=webstores`

## Capability Gates

| Capability | Default | Rule |
| --- | --- | --- |
| Webstore management | Enabled | Always available in full-app and standalone modes. |
| Publish storefront | Disabled | Requires active Webstore entitlement, owner approval/terms, launch checks, and Stripe readiness where required. |
| Shopping cart and checkout | Disabled | Requires active Webstore entitlement, live status, and Stripe/payment readiness. |
| Standalone product mode | Available | Commercial product choice, not a separate Webstores data model. |
| Standalone platform fee | 5% recommended | Eligible amount excludes tax, refunds, and pass-through shipping unless terms change. |

Backend capability contract:

- `GET /api/webstores/capabilities`
- `GET /api/webstores/capabilities?product_mode=standalone`

## Required Enforcement

- Frontend gating explains unavailable actions but is never authoritative.
- Backend services enforce publishing and cart/checkout entitlements.
- Public storefront routes remain unavailable until publishing is enabled.
- Cart, checkout, payment creation, and canonical order bridge remain unavailable until cart/checkout is enabled.
- Disabling commerce does not remove or corrupt store setup, products, owner approvals, or reports.
- Home is an operational dashboard, not a documentation page. Store types appear only during New Store creation, and every top tab uses its own compact contextual ribbon.
