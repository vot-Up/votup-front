---
status: completed
title: "Run standalone schematic: standalone bootstrap"
type: refactor
complexity: high
dependencies:
- task_02
---

# Task 03: Run standalone schematic: standalone bootstrap

## Overview
Execute the Angular standalone migration schematic in "standalone-bootstrap" mode to convert the application from `platformBrowserDynamic().bootstrapModule(AppModule)` to `bootstrapApplication(AppComponent, { providers: [...] })`. This eliminates the root NgModule and completes the standalone architecture migration.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST run `ng generate @angular/core:standalone` with mode "standalone-bootstrap"
- MUST verify the schematic converts `main.ts` to use `bootstrapApplication()`
- MUST verify AppModule is deleted or converted
- MUST verify all providers from AppModule are migrated to bootstrap providers
- MUST manually convert CoreModule's lazy route loading from `loadChildren: () => import('./core/core.module').then(m => m.CoreModule)` to `loadChildren: () => import('./core/core-routing.module').then(m => m.ROUTES)` (direct route import)
- MUST delete CoreModule and CoreRoutingModule module classes after route migration
- MUST convert `RouterModule.forRoot(ROUTES)` to `provideRouter(routes, withComponentInputBinding())`
- MUST convert `HttpClientModule`/`provideHttpClient(withInterceptorsFromDi())` to standalone API (keep `withInterceptorsFromDi` temporarily — functional interceptor comes in task_06)
- MUST convert `BrowserAnimationsModule` to `provideAnimations()`
- MUST verify `ng build` passes with zero errors after all changes
- MUST verify `ng serve` loads the application correctly
</requirements>

## Subtasks
- [x] 3.1 Ensure task_02 is complete and committed
- [x] 3.2 Run `ng generate @angular/core:standalone` selecting "Bootstrap the application using standalone APIs"
- [x] 3.3 Verify `main.ts` now uses `bootstrapApplication(AppComponent, { providers: [...] })`
- [x] 3.4 Manually convert CoreModule lazy loading from module import to direct route import
- [x] 3.5 Delete CoreModule and CoreRoutingModule NgModule classes
- [x] 3.6 Delete AppRoutingModule NgModule class, export routes as a plain `Routes` array
- [x] 3.7 Delete AppModule file
- [x] 3.8 Verify all providers are correctly placed in `bootstrapApplication` providers array
- [x] 3.9 Verify `ng build` passes with zero errors
- [x] 3.10 Verify `ng serve` loads all routes correctly
- [x] 3.11 Run `ng lint --fix` and commit

## Implementation Details

The schematic will attempt to:
- Convert `main.ts` from `platformBrowserDynamic().bootstrapModule(AppModule)` to `bootstrapApplication`
- Copy providers from AppModule into the bootstrap call
- Convert `RouterModule.forRoot` → `provideRouter`
- Convert `BrowserAnimationsModule` → `provideAnimations`
- Remove AppModule

Manual work required:
- CoreModule has `RouterModule.forChild(ROUTES)` which the schematic cannot auto-convert. The app routing must change from lazy-loading the module to lazy-loading the routes directly.
- AppRoutingModule exports ROUTES as a module; after conversion it becomes a plain `Routes` array export.

### Relevant Files
- `src/main.ts` — rewrite from `bootstrapModule` to `bootstrapApplication`
- `src/app/app.module.ts` — will be deleted
- `src/app/app-routing.module.ts` — convert to plain routes export (e.g., `app.routes.ts`)
- `src/app/core/core.module.ts` — will be deleted
- `src/app/core/core-routing.module.ts` — convert to plain routes export (e.g., `core.routes.ts`)
- `src/app/app.component.ts` — converted to standalone by schematic

### Dependent Files
- All files importing from AppModule, CoreModule, AppRoutingModule, CoreRoutingModule
- `angular.json` — may need builder configuration update if entry point changes

### Related ADRs
- [ADR-001: Incremental Schematics-First Migration Strategy](../adrs/adr-001.md) — This is step 3 of the 3-step standalone schematic process

## Deliverables
- `main.ts` uses `bootstrapApplication` with all providers
- AppModule, CoreModule, AppRoutingModule, CoreRoutingModule are all deleted
- Routes are exported as plain `Routes` arrays
- Lazy loading uses direct route imports (no module indirection)
- `ng build` passes with zero errors
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for all routes **(REQUIRED)**

## Tests
- Unit tests:
  - [ ] `bootstrapApplication` is called with correct provider list (provideRouter, provideHttpClient, provideAnimations, etc.)
  - [ ] Route configuration exports a plain Routes array (not a module)
  - [ ] Core routes export a plain Routes array (not a module)
- Integration tests:
  - [ ] `ng build` completes with exit code 0
  - [ ] Application bootstraps without errors at `/main`
  - [ ] Navigation to `/core/users` loads UsersComponent correctly
  - [ ] Navigation to `/core/vote` loads VoteComponent correctly
  - [ ] Navigation to `/core/voters` loads VoterComponent correctly
  - [ ] Navigation to `/core/candidates` loads CandidateComponent correctly
  - [ ] Navigation to `/core/candidate_group` loads PlateComponent correctly
  - [ ] Navigation to `/login` loads LoginComponent correctly
  - [ ] Navigation to `/login-elector` loads LoginElectorComponent correctly
  - [ ] Navigation to `/reset-password` loads ResetPasswordComponent correctly
  - [ ] `grep -r "AppModule\|CoreModule\|SharedModule\|AppRoutingModule\|CoreRoutingModule" src/` returns no results
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- Zero NgModule files in the codebase (5 → 0)
- `main.ts` uses `bootstrapApplication` exclusively
- `ng build` passes with zero errors
- All routes render correctly via `ng serve`
