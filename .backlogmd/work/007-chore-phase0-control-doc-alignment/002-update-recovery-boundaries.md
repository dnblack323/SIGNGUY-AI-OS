<!-- METADATA -->

```yaml
task: Update recovery plan boundaries
status: done
priority: 20
dep: ["work/007-chore-phase0-control-doc-alignment/001-link-source-docs.md"]
assignee: ""
requiresHumanReview: false
expiresAt: null
```

<!-- DESCRIPTION -->

## Description

Update `REBUILD_RECOVERY_PLAN.md` so it distinguishes cross-cutting Phase 0 cleanup from module-owned implementation work. Note which architecture-map recommendations are already satisfied by the current rebuild repo.

<!-- ACCEPTANCE -->

## Acceptance criteria

- [x] `REBUILD_RECOVERY_PLAN.md` defines Phase 0 vs module-owned work.
- [x] Already-applied architecture-map recommendations are called out.
- [x] Remaining cross-cutting drift is recorded without duplicating module specs.
