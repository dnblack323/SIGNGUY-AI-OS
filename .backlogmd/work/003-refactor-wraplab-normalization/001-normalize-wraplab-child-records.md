<!-- METADATA -->

```yaml
task: Normalize Wrap Lab child records
status: done
priority: 10
dep: []
assignee: ""
requiresHumanReview: false
expiresAt: null
```

<!-- DESCRIPTION -->

## Description

Store Wrap Lab files, proofs, damage markers, checklist rows, issues, and chat history as tenant-scoped child records instead of unbounded arrays on `wrap_projects`.

<!-- ACCEPTANCE -->

## Acceptance criteria

- [x] Add normalized Wrap Lab child repository.
- [x] Add index manifest entries for child records.
- [x] Dehydrate child arrays on create/replace/patch.
- [x] Hydrate child arrays on list/get responses for frontend compatibility.
- [x] Update file upload path to append a child record.
- [x] Add regression tests.
- [x] Run focused backend tests.
