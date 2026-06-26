<!-- METADATA -->

```yaml
work: Normalize Wrap Lab project child records
status: done
assignee: ""
```

<!-- DESCRIPTION -->

Move unbounded Wrap Lab arrays out of the authoritative `wrap_projects` aggregate while preserving the current frontend API shape.

<!-- CONTEXT -->

Implementation target is `C:\Users\thesi\Documents\GitHub\signguyai_rebuild_version`. Preserve existing Wrap Lab screens and behavior. Normalize transferred prototype arrays into tenant-scoped child records so future orders, production, files, approvals, and portal activity do not build on embedded mutable aggregates.
