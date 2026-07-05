<!-- METADATA -->

```yaml
work: Build Release 0 identity and tenant runtime foundation
status: done
assignee: ""
```

<!-- DESCRIPTION -->

Start the Release 0 foundation closure by replacing ad hoc preview tenant assumptions with a reusable identity, tenant, role, and permission runtime boundary.

<!-- CONTEXT -->

Implementation target is `C:\Users\thesi\Documents\GitHub\signguyai_rebuild_version`. Source docs are the Auth, Tenants/Organizations, Users/Roles/Permissions, Platform Admin, Activity/Audit, Settings, Files/Storage, Billing/Fees, and SendGrid rebuild docs supplied by the user. Keep this first slice non-breaking for the local preview app: authenticated bearer claims should be supported and validated, while preview header fallback may remain explicit until full auth/login is implemented.
