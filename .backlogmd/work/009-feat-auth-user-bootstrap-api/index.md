<!-- METADATA -->

```yaml
work: Add Release 0 auth and user bootstrap API
status: done
assignee: ""
```

<!-- DESCRIPTION -->

Expose the runtime identity context through stable Auth and Users API routes so the frontend can bootstrap the current user, tenant, role, and permissions from backend-owned contracts.

<!-- CONTEXT -->

Implementation target is `C:\Users\thesi\Documents\GitHub\signguyai_rebuild_version`. This continues the Release 0 foundation closure after the reusable identity/tenant runtime boundary was added. Keep the slice narrow: implement current-user and permission read paths plus a preview-mode dev token helper for local validation, but do not build full password login, registration, invitations, or persistent user management until the module-specific auth/user specs are implemented.
