<!-- METADATA -->

```yaml
work: Build Platform Admin non-login foundation
status: done
assignee: ""
```

<!-- DESCRIPTION -->

Add the Platform Admin backend skeleton needed for launch operations without implementing login, account creation, or impersonation token flows.

<!-- CONTEXT -->

Implementation target is `C:\Users\thesi\Documents\GitHub\signguyai_rebuild_version`. The user asked Codex to hold off on creating logins and related account flows because Emergent will handle that part. This item may use the existing bearer/preview identity helpers and platform-admin permissions, but must not create password/login/registration/impersonation-token behavior.
