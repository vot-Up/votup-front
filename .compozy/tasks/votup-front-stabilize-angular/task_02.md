---
status: completed
title: "Run standalone schematic: prune NgModules"
type: refactor
complexity: medium
dependencies:
    - task_01
---

# Task 02: Run standalone schematic: prune NgModules

## Overview
Execute the Angular standalone migration schematic in "prune-ng-modules" mode to remove NgModules that are no longer necessary after all declarations have been converted to standalone. This eliminates the SharedModule and reduces coupling in AppModule and CoreModule.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST run `ng generate @angular/core:standalone` with mode "prune-ng-modules" on the entire project
- MUST verify `ng build` passes with zero errors after the schematic completes
- MUST manually handle `TODO(standalone-migration)` comments left by the schematic
- MUST remove SharedModule entirely if it becomes safe to delete (no declarations, no providers, no bootstrap, no ModuleWithProviders)
- MUST NOT delete AppModule or CoreModule yet — those are handled in task_03
- SHOULD manually clean up any remaining NgModule references that the schematic cannot remove automatically
</requirements>

## Subtasks
- [x] 2.1 Ensure task_01 is complete and committed
- [x] 2.2 Run `ng generate @angular/core:standalone` selecting "Remove unnecessary NgModule classes"
- [x] 2.3 Verify `ng build` passes with zero compilation errors
- [x] 2.4 Search for `TODO(standalone-migration)` comments and resolve each one manually
- [x] 2.5 Verify SharedModule is deleted (or delete manually if schematic left it)
- [x] 2.6 Verify AppModule and CoreModule still exist (they have providers/routes that need task_03)
- [x] 2.7 Run `ng lint --fix` to resolve formatting issues
- [ ] 2.8 Commit changes with descriptive message

Execution note: 2.8 remains unchecked because this run was explicitly configured with `--auto-commit=false`. The schematic confirmed "Nothing to be done" as AppModule/CoreModule are not prunable automatically. `ng lint --fix` was executed, but it still exits non-zero due to planned `prefer-inject` and `no-explicit-any` cleanup assigned to later tasks.

## Implementation Details

The schematic considers a module safe to remove if it has no `declarations`, no `providers`, no `bootstrap`, no `ModuleWithProviders` imports, and no class members. After task_01, SharedModule should meet these criteria since all its declarations (PhonePipe, LowercaseDirective, UppercaseDirective) are now standalone.

CoreModule has `RouterModule.forChild(ROUTES)` which is a `ModuleWithProviders` — the schematic will NOT remove it automatically. This requires manual migration in task_03.

AppModule bootstraps AppComponent — the schematic skips it intentionally.

### Relevant Files
- `src/app/shared/shared.module.ts` — expected to be deleted by schematic
- `src/app/app.module.ts` — will be modified but NOT deleted yet (has bootstrap + providers)
- `src/app/core/core.module.ts` — will be modified but NOT deleted yet (has RouterModule.forChild)
- Any files importing SharedModule — must update imports to reference standalone pipes/directives directly

### Dependent Files
- `src/app/core/core.module.ts` — currently imports SharedModule; after deletion, standalone imports replace it
- `src/app/app.module.ts` — currently imports SharedModule; after deletion, standalone imports replace it
- All component files that reference SharedModule exports — must import standalone entities directly

### Related ADRs
- [ADR-001: Incremental Schematics-First Migration Strategy](../adrs/adr-001.md) — This is step 2 of the 3-step standalone schematic process

## Deliverables
- SharedModule deleted entirely
- No `TODO(standalone-migration)` comments remaining in the codebase
- `ng build` passes with zero errors
- All standalone pipes/directives are imported directly where used (no SharedModule indirection)
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for build **(REQUIRED)**

## Tests
- Unit tests:
  - [x] PhonePipe can be imported standalone without SharedModule reference
  - [x] LowercaseDirective can be imported standalone without SharedModule reference
  - [x] UppercaseDirective can be imported standalone without SharedModule reference
  - [x] No file in the project imports from SharedModule
- Integration tests:
  - [x] `ng build` completes with exit code 0
  - [x] `grep -r "SharedModule" src/` returns no results
  - [x] Application loads at `/main` route without console errors
  - [x] PhonePipe formatting renders correctly in templates
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- SharedModule no longer exists in the codebase
- Zero `TODO(standalone-migration)` comments
- `ng build` passes with zero errors
- NgModules count reduced from 5 to 3 (AppModule, CoreModule, AppRoutingModule remain)
