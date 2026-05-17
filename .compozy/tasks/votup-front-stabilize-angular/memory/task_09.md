# Task Memory: task_09.md

Keep only task-local execution context here. Do not duplicate facts that are obvious from the repository, task file, PRD documents, or git history.

## Objective Snapshot
- Refactor BaseComponent away from legacy Injector/InjectionToken patterns and verify signal-backed object/tableData/pageLength behavior.

## Important Decisions
- Kept a public `createService<K>(path)` compatibility method, but it now directly creates `BaseService<K>(path, this.http)` instead of any dynamic InjectionToken factory; existing child components rely on this helper.
- Adjusted `BaseService` constructor to accept an optional HttpClient override while defaulting to `inject(HttpClient)`, allowing BaseComponent-created services to work when createService is called outside an Angular injection context.

## Learnings
- Repository already had most Injector removal and signal template updates before this run; grep now reports 0 `Injector`/`InjectionToken` matches under src/app and src/services.
- `saveOrUpdate` merges raw form values into the object signal, so tests for update paths must preserve the id control value or the method correctly follows the create path.
- Fresh verification: build passes; lint has 25 existing warnings and 0 errors; tests pass 35 specs with coverage Statements 81.27%, Branches 67.61%, Functions 87.15%, Lines 81.36%.

## Files / Surfaces
- src/app/core/base.component.ts
- src/app/core/base.component.spec.ts
- src/services/base.service.ts
- .compozy task/memory tracking files

## Errors / Corrections
- Initial BaseComponent spec exposed that `createService` failed outside injection context after BaseService moved to inject(); fixed by passing BaseComponent's injected HttpClient into new BaseService instances.
- Initial update-path spec accidentally nulled the id through form raw values; fixed by including id in the form patch to match BaseComponent behavior.

## Ready for Next Run
- Remaining task_09 gate: browser CRUD flow verification and final commit/tracking status update. If no backend/browser environment is available, record that limitation explicitly before completion.
