---
status: completed
title: Run inject migration schematic
type: refactor
complexity: medium
dependencies:
    - task_03
---

# Task 04: Run inject migration schematic

## Overview
Execute the Angular `inject()` migration schematic to convert all constructor-based dependency injection to Angular's `inject()` function. This eliminates 74 `prefer-inject` lint errors and makes dependencies explicit at the class level.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST run `ng generate @angular/core:inject` on the entire project
- MUST verify `ng build` passes with zero errors after the schematic completes
- MUST verify `ng lint` `prefer-inject` errors are eliminated (was 74)
- MUST manually fix any injection sites the schematic cannot handle (especially BaseComponent's `Injector` pattern and `@Inject(NZ_MODAL_DATA)` sites)
- MUST NOT remove `@Inject(NZ_MODAL_DATA)` — that is the official ng-zorro pattern and must remain
- MUST verify `inject()` calls are placed at the class property level (not inside constructors)
- SHOULD run `ng lint --fix` after the schematic
</requirements>

## Subtasks
- [ ] 4.1 Ensure task_03 is complete and committed
- [ ] 4.2 Run `ng generate @angular/core:inject`
- [ ] 4.3 Verify `ng build` passes with zero compilation errors
- [ ] 4.4 Manually review and fix any injection sites the schematic skipped or mishandled
- [ ] 4.5 Verify `@Inject(NZ_MODAL_DATA)` is preserved in all modal components (VoteItemComponent, UsersItemComponent, PlateItemComponent, VoterItemComponent, CandidateItemComponent, RankingComponent, ResumeVoteComponent)
- [ ] 4.6 Verify BaseComponent still compiles (its manual `Injector` pattern may need manual fixing)
- [ ] 4.7 Run `ng lint --fix`
- [ ] 4.8 Verify `prefer-inject` error count is 0 (down from 74)
- [ ] 4.9 Commit changes

## Implementation Details

The schematic will automatically convert constructor parameters like:
```typescript
constructor(public formBuilder: FormBuilder, public router: Router) {}
```
to:
```typescript
formBuilder = inject(FormBuilder);
router = inject(Router);
```

Known edge cases requiring manual attention:
- BaseComponent uses `Injector` explicitly and calls `injector.get()` — the schematic may not handle this correctly
- Components that extend BaseComponent and pass `injector` to `super()` — these constructor calls will need manual adjustment
- `@Inject(NZ_MODAL_DATA)` must be preserved as-is (it's a token injection, not a service injection)

### Relevant Files
- `src/app/core/base.component.ts` — uses manual `Injector` pattern; may need manual fixing after schematic
- `src/services/auth.service.ts` — constructor injection for HttpClient, Router, AppVariables
- `src/services/base.service.ts` — constructor injection for HttpClient
- `src/utilities/validator/auth.interceptor.ts` — constructor injection for NzMessageService, AuthService
- `src/app/app/app.guard.ts` — constructor injection for AppVariables, AuthService, Router
- All 13+ feature components that extend BaseComponent and pass `injector` to super()
- All 5 modal components that use `@Inject(NZ_MODAL_DATA)`

### Dependent Files
- Every component and service file with constructor injection

### Related ADRs
- [ADR-001: Incremental Schematics-First Migration Strategy](../adrs/adr-001.md) — Inject schematic is part of the automated migration sequence

## Deliverables
- All constructor injection converted to `inject()` (except `@Inject(NZ_MODAL_DATA)` which must remain)
- `ng build` passes with zero errors
- `prefer-inject` lint errors: 0 (down from 74)
- BaseComponent still compiles and functions correctly
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for DI resolution **(REQUIRED)**

## Tests
- Unit tests:
  - [ ] AuthService resolves HttpClient and Router via `inject()`
  - [ ] BaseService resolves HttpClient via `inject()`
  - [ ] LoginComponent resolves FormBuilder, Router, AuthService via `inject()`
  - [ ] VoteComponent resolves NzModalService, DatePipe, AuthService via `inject()`
  - [ ] `@Inject(NZ_MODAL_DATA)` still works in VoteItemComponent
  - [ ] `@Inject(NZ_MODAL_DATA)` still works in UsersItemComponent
  - [ ] `@Inject(NZ_MODAL_DATA)` still works in PlateItemComponent
- Integration tests:
  - [ ] `ng build` completes with exit code 0
  - [ ] `ng lint` reports 0 `prefer-inject` errors
  - [ ] Application bootstraps and all routes load without DI resolution errors
  - [ ] Modal components receive `NZ_MODAL_DATA` correctly when opened
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- `prefer-inject` lint errors: 0 (down from 74)
- `ng build` passes with zero errors
- `@Inject(NZ_MODAL_DATA)` preserved in all modal components
- Application functions correctly on all routes
