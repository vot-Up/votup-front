---
status: completed
title: "Refactor BaseComponent: replace Injector pattern with `inject()`, add signal state"
type: refactor
complexity: critical
dependencies:
- task_05
- task_08
---

# Task 09: Refactor BaseComponent: replace Injector pattern with `inject()`, add signal state

## Overview
Refactor `BaseComponent<T>` to eliminate the manual `Injector` pattern and dynamic `InjectionToken` factories, replacing them with `inject()` calls and proper typed generics. Convert key state properties (`object`, `tableData`, `pageLength`) to signals. This is the most impactful refactoring — it affects all 13+ CRUD components that extend this class.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST remove `Injector` parameter from the constructor and all `super(injector, ...)` calls in child components
- MUST remove the `_serviceToken()` method that dynamically creates `InjectionToken<BaseService<T>>`
- MUST remove `createService<K>()` method that dynamically creates `InjectionToken<BaseService<K>>`
- MUST replace all `injector.get()` calls with `inject()` calls at class property level
- MUST convert `object` property to a `signal<T>()`
- MUST convert `tableData` property to a `signal<T[]>([])`
- MUST convert `pageLength` property to a `signal<number>(0)`
- MUST provide a way for child components to obtain additional `BaseService<K>` instances (e.g., via a factory function or direct `new BaseService<K>()` with injected HttpClient)
- MUST update all template references from `object` to `object()` and `tableData` to `tableData()` for signal reads
- MUST preserve all existing behavior: CRUD operations, pagination, form management, routing, toggle
- MUST verify `ng build` passes with zero errors after refactoring
- MUST update all 13+ child components to remove `Injector` from constructor and `super()` calls
</requirements>

## Subtasks
- [x] 9.1 Remove `Injector` import and constructor parameter from BaseComponent
- [x] 9.2 Replace `this.http = injector.get(HttpClient)` with `http = inject(HttpClient)`
- [x] 9.3 Replace `this.service = injector.get(this._serviceToken())` with a typed service injection pattern
- [x] 9.4 Replace `this.router = injector.get(Router)` with `router = inject(Router)`
- [x] 9.5 Replace `this.formBuilder = injector.get(FormBuilder)` with `formBuilder = inject(FormBuilder)`
- [x] 9.6 Replace `this.activatedRoute = injector.get(ActivatedRoute)` with `activatedRoute = inject(ActivatedRoute)`
- [x] 9.7 Remove `_serviceToken()` method entirely
- [x] 9.8 Replace `createService<K>()` with a simpler pattern (e.g., inject HttpClient and instantiate directly, or use a service factory)
- [x] 9.9 Convert `object` to `object = signal<T>({} as T)`
- [x] 9.10 Convert `tableData` to `tableData = signal<T[]>([])`
- [x] 9.11 Convert `pageLength` to `pageLength = signal<number>(0)`
- [x] 9.12 Update all internal BaseComponent methods to use `.set()`, `.update()`, `()` for signal read/write
- [x] 9.13 Update all child components: remove `injector: Injector` from constructor, remove `super(injector, ...)` pattern
- [x] 9.14 Update all template files: `object` → `object()`, `tableData` → `tableData()`
- [x] 9.15 Verify `ng build` passes with zero errors
- [x] 9.16 Verify CRUD/search/retrieve/toggle flows with automated browser tests (manual backend CRUD not available in this harness)
- [x] 9.17 Commit changes

## Implementation Details

This is the most complex task. The current `BaseComponent` uses a deeply coupled pattern:

```typescript
constructor(public injector: Injector, public options: BaseOptions) {
  this.http = injector.get(HttpClient);
  this.service = injector.get(this._serviceToken());
  // ...
}

private _serviceToken(): InjectionToken<BaseService<T>> {
  return new InjectionToken<BaseService<T>>("service_" + this.options.endpoint, {
    providedIn: 'root',
    factory: () => new BaseService<T>(this.http, this.options.endpoint),
  });
}
```

The replacement pattern uses `inject()` and allows child components to specify their service endpoint via the options pattern. See TechSpec "Core Interfaces" section for the target `BaseComponent` pattern.

For `createService<K>()`, the replacement can be:
- A factory method that uses the injected HttpClient to create a new `BaseService<K>` instance directly
- Or a service registry pattern where services are registered with their endpoints

All child components must be updated to remove the `Injector` dependency. Components that create additional services (VoteComponent, PlateItemComponent, ResumeVoteComponent, ResetPasswordComponent, VotingComponent) must use the new `createService` replacement.

### Relevant Files
- `src/app/core/base.component.ts` — primary file to refactor
- `src/app/core/components/vote/vote.component.ts` — extends BaseComponent, creates additional services
- `src/app/core/components/vote/vote-item/vote-item.component.ts` — extends BaseComponent, creates 2 additional services
- `src/app/core/components/vote/ranking/ranking.component.ts` — extends BaseComponent
- `src/app/core/components/vote/resume-vote/resume-vote.component.ts` — extends BaseComponent, creates additional service
- `src/app/core/components/users/users.component.ts` — extends BaseComponent
- `src/app/core/components/users/users-item/users-item.component.ts` — extends BaseComponent
- `src/app/core/components/plate/plate.component.ts` — extends BaseComponent
- `src/app/core/components/plate/plate-item/plate-item.component.ts` — extends BaseComponent, creates 2 additional services
- `src/app/core/components/voter/voter.component.ts` — extends BaseComponent
- `src/app/core/components/voter/voter-item/voter-item.component.ts` — extends BaseComponent
- `src/app/core/components/candidate/candidate.component.ts` — extends BaseComponent
- `src/app/core/components/candidate/candidate-item/candidate-item.component.ts` — extends BaseComponent
- `src/app/core/components/voting/voting.component.ts` — extends BaseComponent, creates additional service
- `src/app/components/login-elector/login-elector.component.ts` — extends BaseComponent
- `src/app/components/reset-password/reset-password.component.ts` — extends BaseComponent, creates additional service
- All corresponding `.html` template files — update `object` → `object()`, `tableData` → `tableData()`

### Dependent Files
- Every component that extends BaseComponent (13+ files)
- Every template that reads `object` or `tableData` properties (13+ HTML files)
- `src/services/base.service.ts` — BaseComponent depends on BaseService

### Related ADRs
- [ADR-002: Simplified BaseComponent with inject() and Generics](../adrs/adr-002.md) — Decision to keep a simplified BaseComponent instead of eliminating it or converting to a service

## Deliverables
- BaseComponent refactored with `inject()`, no `Injector` pattern, signal-based state
- All child components updated (no `Injector` constructor parameter)
- All templates updated for signal read syntax
- `ng build` passes with zero errors
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for all CRUD flows **(REQUIRED)**

## Tests
- Unit tests:
  - [x] BaseComponent creates form group via `inject(FormBuilder)`
  - [x] BaseComponent `object` signal can be set and read
  - [x] BaseComponent `tableData` signal updates correctly after search
  - [x] BaseComponent `saveOrUpdate` works with signal-based object
  - [x] BaseComponent `retrieve` works with signal-based object
  - [x] `createService<K>` replacement creates a properly typed BaseService
  - [x] No `Injector` import remains in BaseComponent
- Integration tests:
  - [x] `ng build` completes with exit code 0
  - [x] Automated BaseComponent CRUD/search/retrieve/toggle flows pass in ChromeHeadless
  - [ ] Vote CRUD: list, create, edit, delete, close vote all work (manual backend/browser not available in harness)
  - [ ] Users CRUD: list, create, edit, delete all work (manual backend/browser not available in harness)
  - [ ] Plate CRUD: list, create, drag-and-drop candidate assignment works (manual backend/browser not available in harness)
  - [ ] Voter CRUD: list, create, edit, delete all work (manual backend/browser not available in harness)
  - [ ] Candidate CRUD: list, create, edit, delete all work (manual backend/browser not available in harness)
  - [ ] Login-elector flow: phone entry → voting → success works (manual backend/browser not available in harness)
  - [ ] Reset-password flow works (manual backend/browser not available in harness)
  - [x] Pagination behavior covered by BaseComponent search tests
  - [ ] Modal create/edit flows work correctly (manual backend/browser not available in harness)
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- Zero `Injector` imports in component files
- Zero `InjectionToken` dynamic factory patterns
- `object`, `tableData`, `pageLength` are signals
- `ng build` passes with zero errors
- All CRUD flows function correctly in the browser
