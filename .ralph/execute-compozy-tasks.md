# Execute Compozy Tasks for VotUp Front Angular 21 Stabilization

## Goal
Execute pending Compozy PRD tasks (task_02 through task_13) one at a time for the votup-front Angular 21 stabilization project.

## Context
- PRD directory: `/home/smovisk/PycharmProjects/votup-front/.compozy/tasks/votup-front-stabilize-angular`
- Master tasks file: `/home/smovisk/PycharmProjects/votup-front/.compozy/tasks/votup-front-stabilize-angular/_tasks.md`
- Task files: `task_02.md` through `task_13.md`
- Workflow memory directory: `/home/smovisk/PycharmProjects/votup-front/.compozy/tasks/votup-front-stabilize-angular/memory`
- Auto-commit: enabled
- Task 01 is already completed
- Current state: dirty working tree with task_01 standalone conversion changes

## Checklist
- [ ] Task 02: Run standalone schematic: prune NgModules
- [ ] Task 03: Run standalone schematic: standalone bootstrap
- [ ] Task 04: Run inject migration schematic
- [ ] Task 05: Run signal-input, output, and signal-queries schematics
- [ ] Task 06: Rewrite AuthInterceptor as functional interceptor
- [ ] Task 07: Rewrite AppGuard as functional guard
- [ ] Task 08: Refactor BaseService
- [ ] Task 09: Refactor BaseComponent
- [ ] Task 10: Convert component local state to signals and apply OnPush
- [ ] Task 11: Clean up dead service files and model any types
- [ ] Task 12: Enable zoneless with Zone.js fallback
- [ ] Task 13: Full zoneless: remove Zone.js, optimize bundle, final lint cleanup

## Current focus
Start with Task 02. Execute it fully using cy-execute-task workflow before moving to task 03.