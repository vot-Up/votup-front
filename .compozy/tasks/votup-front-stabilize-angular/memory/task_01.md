# Task Memory: task_01.md

Keep only task-local execution context here. Do not duplicate facts that are obvious from the repository, task file, PRD documents, or git history.

## Objective Snapshot
- Convert existing Angular declarations to standalone with the official standalone schematic convert step, then verify build/lint and absence of `standalone: false`.

## Important Decisions
- Repository root does not contain `AGENTS.md` or `CLAUDE.md`; searched parent projects and found no repo-local copies for `votup-front`.
- PRD/TechSpec say adding tests is out of scope and the repo has zero `.spec.ts` coverage; treating the task's generated 80% coverage/unit-test checklist as conflicting boilerplate for this schematic-only task.
- Auto-commit is disabled by the user prompt. The task requirement to commit is superseded for this run; leave diff ready for manual review.

## Learnings
- Baseline before migration: 23 `standalone: false` entries under `src/`; no `TODO(standalone-migration)` comments.
- Current branch is `upgrade/angular-21-20260516-195225`; worktree already has pre-existing `.gitignore`, `.agents/`, and `.compozy/` changes.
- Baseline lint was 148 problems: 97 errors and 51 warnings. After migration, lint is 125 problems: 74 errors and 51 warnings, with remaining errors from `prefer-inject`.
- The standalone schematic intentionally left `AppComponent` as non-standalone while `AppModule` bootstraps it; converting only its metadata/imports and importing it into `AppModule` still builds successfully.
- `ng serve` compiles and headless Chrome renders `/`, `/main`, `/login`, `/core/vote`, and `/core/users` without browser stderr errors. Unauthenticated core routes redirect/render the public main/login-elector flow.
- `npm test -- --watch=false --browsers=ChromeHeadless --progress=false` fails with TS18003 because `tsconfig.spec.json` matches no spec inputs; no unit tests exist in the current repo.

## Files / Surfaces
- Expected primary surfaces: component/directive/pipe decorators under `src/`, plus NgModule imports/declarations in `app.module.ts`, `core.module.ts`, and `shared.module.ts`.
- Touched generated surfaces: 23 declarations under `src/`, `AppModule`, `CoreModule`, and `SharedModule`.
- Manual metadata-only follow-up: `src/app/app.component.ts` and `src/app/app.module.ts` to make `AppComponent` standalone while preserving `AppModule` bootstrap for later Task 03.

## Errors / Corrections
- Direct `curl` to client routes returned dev-server 404 pages, but headless Chrome route loads rendered Angular DOM. Use browser-based route smoke evidence rather than raw curl for client-side routes.

## Ready for Next Run
- No `standalone: false` remains under `src/`.
- No `TODO(standalone-migration)` comments remain under `src/`.
- Next migration task can start from a build-passing convert-to-standalone state; remaining lint errors are the expected `prefer-inject` errors for later inject migration.
