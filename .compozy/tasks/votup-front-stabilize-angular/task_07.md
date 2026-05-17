---
status: pending
title: Rewrite AppGuard as functional guard
type: refactor
complexity: low
dependencies:
- task_04
---

# Task 07: Rewrite AppGuard as functional guard

## Overview
Convert the class-based `AppGuard` (implements `CanActivate`, `CanLoad`, `CanDeactivate`) to a functional guard (`CanActivateFn`) using `inject()` internally. The current `CanDeactivate` logic always returns `true` and should be removed as dead code.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST rewrite `AppGuard` as a `CanActivateFn` function named `authGuard`
- MUST use `inject(AuthService)` and `inject(Router)` inside the function
- MUST preserve authentication check logic: if logged in return true, otherwise logout and redirect
- MUST remove the `CanDeactivate` implementation (it always returns `true` — dead code)
- MUST update route configurations to use `canActivate: [authGuard]` and `canLoad: [authGuard]`
- MUST remove the `AppGuard` class file
- MUST remove `AppGuard` from any provider arrays
- MUST verify `ng build` passes with zero errors
</requirements>

## Subtasks
- [ ] 7.1 Ensure task_04 is complete
- [ ] 7.2 Create `authGuard` as `CanActivateFn` in a new file (e.g., `src/app/app/auth.guard.ts` replaces class)
- [ ] 7.3 Implement: check `authService.isLoggedIn()`, return true or logout+redirect
- [ ] 7.4 Update all route configurations to use `canActivate: [authGuard]` instead of class reference
- [ ] 7.5 Remove the old `AppGuard` class
- [ ] 7.6 Remove `AppGuard` from any provider arrays in bootstrap config
- [ ] 7.7 Verify `ng build` passes
- [ ] 7.8 Manually test: unauthenticated access redirects to login, authenticated access proceeds
- [ ] 7.9 Commit changes

## Implementation Details

The current `AppGuard` implements three interfaces but only `CanActivate` and `CanLoad` do anything meaningful (both call `checkAuthentication()`). `CanDeactivate` always returns `true`.

The functional guard is a simple function. See TechSpec "Core Interfaces" section for the `authGuard` pattern.

Routes that need guard: the `core` lazy-loaded route and its children currently use `AppGuard`. After conversion, they reference `authGuard` function directly.

### Relevant Files
- `src/app/app/app.guard.ts` — rewrite from class to function
- Route configuration file (was `app-routing.module.ts`, now plain routes) — update guard references
- Core route configuration file — update guard references

### Dependent Files
- `src/services/auth.service.ts` — injected by the functional guard
- All protected routes in the application

### Related ADRs
- [ADR-005: Functional Route Guards](../adrs/adr-005.md) — Decision to use functional guards over class-based

## Deliverables
- `authGuard` function implementing `CanActivateFn`
- Old `AppGuard` class removed
- Route configurations use `canActivate: [authGuard]`
- `AppGuard` removed from all provider arrays
- `ng build` passes with zero errors
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for auth redirect **(REQUIRED)**

## Tests
- Unit tests:
  - [ ] `authGuard` returns `true` when user is logged in (token exists)
  - [ ] `authGuard` calls `authService.logout(false, true)` and returns `false` when user is not logged in
  - [ ] `authGuard` uses `inject()` for AuthService and Router (no constructor)
- Integration tests:
  - [ ] Unauthenticated navigation to `/core/users` redirects to login/main
  - [ ] Authenticated navigation to `/core/users` loads the component
  - [ ] Application bootstraps without guard resolution errors
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- No class-based guard references in the codebase
- `authGuard` function used in all route `canActivate` arrays
- Unauthenticated access correctly redirects
- `ng build` passes with zero errors
