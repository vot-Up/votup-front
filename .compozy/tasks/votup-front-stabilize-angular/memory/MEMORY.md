# Workflow Memory

## Current State
- Task 01: COMPLETED — standalone conversion done, SharedModule deleted, components are standalone
- Task 02: COMPLETED — prune-ng-modules schematic ran (no additional changes needed; AppModule/CoreModule kept for task_03)
- Next task: Task 03 (standalone bootstrap)

## Shared Decisions
- Proceed incrementally per ADR-001; validate build after each step
- Test creation is out of scope per PRD non-goals; existing .spec.ts files are untracked/experimental

## Shared Learnings
- `ng generate @angular/core:standalone --mode=<mode>` requires explicit `--mode=` flag; interactive piping is unreliable
- Only 2 real @NgModule remain: AppModule (bootstrap + providers) and CoreModule (RouterModule.forChild)
- app-routing.module.ts and core-routing.module.ts just export Routes arrays, not @NgModule classes
- Lint baseline: 74 errors (prefer-inject) + 52 warnings (no-explicit-any); these are for tasks 04+
- Build baseline: 2.32 MB initial total, main chunk 1.64 MB

## Open Risks
- `npm test` fails with TS18003 because tsconfig.spec.json matches no inputs and repo has zero .spec.ts files
- ng-zorro-antd zoneless compatibility untested until task 12

## Handoffs
- Task 03 will convert bootstrap to standalone, delete AppModule, convert CoreModule lazy loading to standalone routes
