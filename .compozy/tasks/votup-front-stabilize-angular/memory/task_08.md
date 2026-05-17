# Task Memory: task_08.md

Keep only task-local execution context here. Do not duplicate facts that are obvious from the repository, task file, PRD documents, or git history.

## Objective Snapshot
- Refactor BaseService for typed request options, typed CRUD helpers, HttpClient via inject(), zero no-explicit-any warnings in src/services/base.service.ts, and HTTP unit coverage.

## Important Decisions
- Kept BaseService manually constructible with a path argument because BaseComponent/createService instantiate endpoint-specific service wrappers; HttpClient is now obtained with inject() inside Angular injection context.
- `addParameter` accepts only string | number | boolean; existing array expand parameters were converted at call sites to comma-delimited strings to preserve the prior `String(array)` query behavior.
- `deleteFromListRoute` uses a generic `M extends object` body parameter so existing model class payloads compile without reintroducing any.

## Learnings
- `ng lint` still has repo-wide warnings outside BaseService, but BaseService reports 0 no-explicit-any warnings and 0 lint errors.
- Coverage with `npm test -- --watch=false --browsers=ChromeHeadless --code-coverage`: 23 specs pass; statements 96.71%, branches 80.76%, functions 100%, lines 96.64%.

## Files / Surfaces
- src/services/base.service.ts
- src/services/base.service.spec.ts
- src/app/core/base.component.ts
- src/app/core/components/vote/resume-vote/resume-vote.component.ts
- src/app/core/components/vote/vote-item/vote-item.component.ts
- src/app/core/components/voting/voting.component.ts

## Errors / Corrections
- Initial build failed after tightening types because class model bodies were not assignable to Record<string, unknown>; fixed by making deleteFromListRoute body generic over object.
- Initial coverage test had one URL expectation mismatch when query params were present; fixed with a predicate expectation.

## Ready for Next Run
- Task 09 can proceed with BaseComponent refactoring; BaseComponent still has legacy typing patterns outside this task's scope.
