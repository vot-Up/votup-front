# Task Memory: task_04.md

Keep only task-local execution context here. Do not duplicate facts that are obvious from the repository, task file, PRD documents, or git history.

## Objective Snapshot
- Run Angular's `@angular/core:inject` schematic only after Task 03 standalone bootstrap is complete and committed.

## Important Decisions
- Do not run the inject schematic while Task 03 remains incomplete; Task 04 explicitly depends on Task 03 and subtask 4.1 requires confirming it is complete and committed.

## Learnings
- Task 03 is not complete in the current workspace: `src/main.ts` still uses `platformBrowserDynamic().bootstrapModule(AppModule)`, App/Core routing/module files still exist, and `_tasks.md` marks Task 03 as `pending`.
- Current git history shows the latest migration commit is `db85929 task_01: convert declarations to standalone`; there is no Task 03 commit visible in the last five commits.

## Files / Surfaces
- Checked `src/main.ts`, `src/app/app.module.ts`, `src/app/core/core.module.ts`, `src/app/app-routing.module.ts`, `src/app/core/core-routing.module.ts`, `_tasks.md`, and git history.

## Errors / Corrections
- Blocker: Task 04 cannot proceed without expanding scope into Task 03. Source files were not changed.

## Ready for Next Run
- Complete and commit Task 03 standalone bootstrap first, then rerun Task 04 from subtask 4.1.
