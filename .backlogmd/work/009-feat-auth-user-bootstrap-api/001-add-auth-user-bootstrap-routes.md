<!-- METADATA -->

```yaml
task: Add Auth and Users bootstrap routes
status: done
priority: 10
dep: []
assignee: ""
requiresHumanReview: false
expiresAt: null
```

<!-- DESCRIPTION -->

## Description

Add backend routes for current-user bootstrap and permissions using the centralized runtime identity context. Include a preview-only dev token endpoint so local builds can validate bearer-token flows before full login is implemented.

<!-- ACCEPTANCE -->

## Acceptance criteria

- [x] `GET /api/auth/me` and `GET /api/users/me` return the current identity context without raw token claims.
- [x] `GET /api/auth/permissions` and `GET /api/users/me/permissions` return backend-owned permissions.
- [x] `POST /api/auth/dev-token` issues local HS256 bearer tokens in preview mode and is disabled in enforced mode.
- [x] Focused backend tests and full backend/frontend verification pass.
