<!-- METADATA -->

```yaml
task: Add runtime identity and tenant context
status: done
priority: 10
dep: []
assignee: ""
requiresHumanReview: false
expiresAt: null
```

<!-- DESCRIPTION -->

## Description

Add the backend foundation for resolving authenticated tenant/user context from signed bearer claims, while keeping the current local preview fallback explicit. Add canonical role and permission primitives so future routes use one backend source instead of scattered permission logic.

<!-- ACCEPTANCE -->

## Acceptance criteria

- [x] Runtime context can resolve tenant/user/role from a signed bearer token.
- [x] Preview tenant fallback remains available only through an explicit preview mode.
- [x] Platform creator, platform admin, and owner roles use the same permission bypass behavior.
- [x] Tests cover token tenant resolution, preview fallback, enforced-mode rejection, and permission behavior.
