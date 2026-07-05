<!-- METADATA -->

```yaml
task: Add Platform Admin tenant status API
status: done
priority: 10
dep: []
assignee: ""
requiresHumanReview: false
expiresAt: null
```

<!-- DESCRIPTION -->

Add platform-admin-only endpoints for tenant list/detail, tenant billing/account status updates, and admin audit events. Exclude impersonation and login flows from this task.

<!-- ACCEPTANCE -->

## Acceptance criteria

- [x] Platform admin role can list tenant records across tenants.
- [x] Non-platform roles cannot access Platform Admin endpoints.
- [x] Platform admin can update tenant account/billing status.
- [x] Tenant status updates create platform admin audit events.
- [x] No login, registration, password, or impersonation token flow is added.
