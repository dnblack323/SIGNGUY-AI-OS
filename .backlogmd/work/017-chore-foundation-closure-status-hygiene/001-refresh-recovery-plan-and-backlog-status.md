<!-- METADATA -->

```yaml
task: Refresh recovery plan and backlog status
status: done
priority: 10
dep: []
assignee: ""
requiresHumanReview: false
expiresAt: null
```

<!-- DESCRIPTION -->

Update stale recovery-plan claims after the production-required cleanup and clear done-task assignees so backlog metadata matches the backlog spec.

<!-- ACCEPTANCE -->

## Acceptance criteria

- [x] Done backlog items/tasks touched by recent Foundation Closure work have empty assignees.
- [x] `REBUILD_RECOVERY_PLAN.md` no longer claims `production_flow_enabled` remains in the order model.
- [x] `REBUILD_RECOVERY_PLAN.md` records the current repeatable verification commands instead of stale missing-dependency blockers.
- [x] The plan still preserves the user's instruction that login/account creation work is not handled in this Codex slice.
