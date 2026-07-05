<!-- METADATA -->

```yaml
work: Align production-required order item schema
status: done
assignee: ""
```

<!-- DESCRIPTION -->

Replace the remaining `production_flow_enabled` drift with the canonical `production_required` field and ensure work order drafts only snapshot production-required order items.

<!-- CONTEXT -->

Implementation target is `C:\Users\thesi\Documents\GitHub\signguyai_rebuild_version`. `PHASE_0_DECISIONS.md` locks the production rule as `production_required = true`. `REBUILD_RECOVERY_PLAN.md` explicitly blocks deeper production-board work until this schema drift is corrected.
