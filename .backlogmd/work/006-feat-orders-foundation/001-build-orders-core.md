<!-- METADATA -->

```yaml
task: Build Orders core
status: done
priority: 10
dep: []
assignee: "/root"
requiresHumanReview: false
expiresAt: null
```

<!-- DESCRIPTION -->

## Description

Add core backend and frontend support for Orders and Order Items/Job Tickets without building full quote, invoice, PDF, or production-board workflows yet.

<!-- ACCEPTANCE -->

## Acceptance criteria

- [x] Add Orders/Order Items models, repositories, routes, indexes, and events.
- [x] Add category schemas for the nine order item categories.
- [x] Add first pricing calculation/snapshot endpoint using integer minor units.
- [x] Add DocuLink-backed file linking endpoints for orders/items.
- [x] Add basic Orders frontend workspace with list, detail tabs, item creation, pricing, files, and activity.
- [x] Add tests for tenant isolation, no embedded item arrays, item specs, pricing snapshots, events, and file linking.
