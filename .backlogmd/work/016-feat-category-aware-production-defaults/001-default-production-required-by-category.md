<!-- METADATA -->

```yaml
task: Default production required by item category
status: done
priority: 10
dep: []
assignee: ""
requiresHumanReview: false
expiresAt: null
```

<!-- DESCRIPTION -->

Centralize default production-required rules, apply them when new Order Items omit an explicit value, and keep the Orders UI aligned with the same defaults.

<!-- ACCEPTANCE -->

## Acceptance criteria

- [x] Backend creates physical product Order Items with `production_required = true` when omitted.
- [x] Backend creates service/non-production Order Items with `production_required = false` when omitted.
- [x] Explicit user/API overrides still win.
- [x] Orders UI updates the create-item checkbox when the category changes.
- [x] Tests cover backend defaults and work-order exclusion of non-production defaults.
