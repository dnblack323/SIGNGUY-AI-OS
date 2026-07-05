<!-- METADATA -->

```yaml
task: Rename production required and gate work orders
status: done
priority: 10
dep: []
assignee: ""
requiresHumanReview: false
expiresAt: null
```

<!-- DESCRIPTION -->

Rename order item payload/patch fields from `production_flow_enabled` to `production_required`, keep backwards-compatible read handling for existing records, and update work-order generation so only production-required order items become production items.

<!-- ACCEPTANCE -->

## Acceptance criteria

- [x] `backend/models/orders.py` uses `production_required`.
- [x] Active API/frontend code uses `production_required`; the only remaining `production_flow_enabled` references are the repository compatibility alias and its test.
- [x] Work-order generation excludes non-production-required items.
- [x] Tests cover generating work orders only from `production_required = true` items, rejecting orders with no production-required items, and normalizing legacy saved item records.
- [x] Focused and full backend tests pass.
