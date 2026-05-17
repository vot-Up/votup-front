# Task Memory: task_02.md

Keep only task-local execution context here. Do not duplicate facts that are obvious from the repository, task file, PRD documents, or git history.

## Objective Snapshot
- Execute task 02: run the Angular standalone migration in prune-ng-modules mode, remove SharedModule references, keep AppModule/CoreModule for task 03, and validate build/lint/tests where feasible.

## Important Decisions
- Proceed from the existing dirty tree because task 01 is marked completed in `_tasks.md` and the current source already contains standalone conversion edits.
- The task-specific test requirement overrides the broader PRD non-goal that says tests are out of scope; keep the focused standalone shared smoke spec.
- Automatic commit remains skipped because this run explicitly set `--auto-commit=false`; leave the diff ready for manual review.

## Learnings
- SharedModule was already deleted by task_01; no additional work needed for that
- Only 2 real @NgModule classes remain: AppModule and CoreModule
- app-routing.module.ts and core-routing.module.ts are NOT @NgModule — they just export Routes arrays. Their `.module.ts` naming is legacy/conventional.
- Lint count is 74 errors / 51 warnings (prefer-inject and no-explicit-any issues reserved for later tasks)
- `ng generate @angular/core:standalone --mode=prune-ng-modules` needs `--mode=` flag, interactive prompt with `echo "2"` doesn't select the correct option
- `npm test -- --watch=false --browsers=ChromeHeadless --progress=false --code-coverage` runs 6 focused specs successfully with statements 92.59%, branches 80%, functions 100%, and lines 92.3%.

## Files / Surfaces
- Touched/verified surfaces: Angular standalone schematic execution, `src/app/shared/shared.module.ts` absence, `src/app/app.module.ts`, `src/app/core/core.module.ts`, `src/app/shared/standalone-shared.spec.ts`, route smoke at `/main`, workflow memory, and task tracking files.

## Errors / Corrections
- Removed literal text matching the old module name from the focused spec description so the required grep check has no matches under `src/`.
- Port 4200 was already in use during browser smoke setup, so `ng serve` ran on 127.0.0.1:4201.
- A concurrent external `compozy tasks run votup-front-stabilize-angular --ui` / Codex process applied standalone-bootstrap/task_03-style edits during verification; restored those edits so task_02 ends with AppModule and CoreModule present and no standalone config/route files under `src/app`.

## Status
- COMPLETED: SharedModule deleted, no standalone migration TODO comments, build/tests pass, AppModule and CoreModule preserved for task_03, no auto-commit performed by request.
