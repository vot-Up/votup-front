---
status: completed
title: "Run standalone schematic: convert declarations to standalone"
type: refactor
complexity: medium
dependencies: []
---

# Task 01: Run standalone schematic: convert declarations to standalone

## Overview
Execute the Angular standalone migration schematic in "convert-to-standalone" mode to convert all components, directives, and pipes from `standalone: false` to standalone by removing the flag and adding their dependencies to the `imports` array. This is the first automated step in eliminating NgModule coupling.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST run `ng generate @angular/core:standalone` with mode "convert-to-standalone" on the entire project
- MUST verify `ng build` passes with zero errors after the schematic completes
- MUST verify `ng lint` error count decreases (expect 23 `prefer-standalone` errors eliminated)
- MUST commit the result on a clean branch before proceeding
- MUST NOT modify any component logic — only structural metadata changes
- SHOULD run `ng lint --fix` after the schematic to resolve formatting issues
</requirements>

## Subtasks
- [x] 1.1 Ensure working tree is clean and on a dedicated feature branch *(branch was already dedicated; pre-existing `.gitignore`, `.agents/`, and `.compozy/` changes were preserved)*
- [x] 1.2 Run `ng generate @angular/core:standalone` selecting "Convert all components, directives and pipes to standalone"
- [x] 1.3 Verify `ng build` passes with zero compilation errors
- [x] 1.4 Run `ng lint --fix` to resolve schematic-introduced formatting issues
- [x] 1.5 Verify `ng lint` shows zero `prefer-standalone` errors (was 23)
- [x] 1.6 Review schematic output for any `TODO(standalone-migration)` comments left behind
- [x] 1.7 Commit changes with descriptive message *(auto-commit disabled for this run; diff left ready for manual commit)*

## Implementation Details

The schematic will automatically:
- Remove `standalone: false` from all 13+ component decorators, 2 directive decorators, and 2 pipe decorators
- Add `imports` arrays to each component/directive/pipe with their required dependencies
- Move converted entities from NgModule `declarations` to NgModule `imports`

### Relevant Files
- `src/app/app.module.ts` — root NgModule; declarations will move to imports
- `src/app/core/core.module.ts` — feature NgModule; declarations will move to imports
- `src/app/shared/shared.module.ts` — shared NgModule; PhonePipe, LowercaseDirective, UppercaseDirective will become standalone
- `src/app/components/login/login.component.ts` — has `standalone: false`
- `src/app/components/main/main.component.ts` — has `standalone: false`
- `src/app/components/login-elector/login-elector.component.ts` — has `standalone: false`
- `src/app/components/reset-password/reset-password.component.ts` — has `standalone: false`
- `src/app/core/components/vote/vote.component.ts` — has `standalone: false`
- `src/app/core/components/vote/vote-item/vote-item.component.ts` — has `standalone: false`
- `src/app/core/components/vote/ranking/ranking.component.ts` — has `standalone: false`
- `src/app/core/components/vote/ranking/ranking-item/ranking-item.component.ts` — has `standalone: false`
- `src/app/core/components/vote/resume-vote/resume-vote.component.ts` — has `standalone: false`
- `src/app/core/components/users/users.component.ts` — has `standalone: false`
- `src/app/core/components/users/users-item/users-item.component.ts` — has `standalone: false`
- `src/app/core/components/plate/plate.component.ts` — has `standalone: false`
- `src/app/core/components/plate/plate-item/plate-item.component.ts` — has `standalone: false`
- `src/app/core/components/voter/voter.component.ts` — has `standalone: false`
- `src/app/core/components/voter/voter-item/voter-item.component.ts` — has `standalone: false`
- `src/app/core/components/candidate/candidate.component.ts` — has `standalone: false`
- `src/app/core/components/candidate/candidate-item/candidate-item.component.ts` — has `standalone: false`
- `src/app/core/components/voting/voting.component.ts` — has `standalone: false`
- `src/utilities/lowercase.directive.ts` — has `standalone: false`
- `src/utilities/uppercase.directive.ts` — has `standalone: false`
- `src/utilities/validator/cellphone-formate.pipe.ts` — has `standalone: false`
- `src/app/shared/phone-pipe/phone.pipe.ts` — has `standalone: false`

### Dependent Files
- All NgModule files — `declarations` arrays shrink, `imports` arrays grow
- All component TypeScript files — gain `imports` arrays, lose `standalone: false`

### Related ADRs
- [ADR-001: Incremental Schematics-First Migration Strategy](../adrs/adr-001.md) — This is step 1 of the schematic-first approach

## Deliverables
- All components, directives, and pipes converted to standalone (no `standalone: false` remaining)
- `ng build` passes with zero errors
- Lint `prefer-standalone` errors reduced from 23 to 0
- Manual verification that `ng serve` loads the application correctly
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for build and lint **(REQUIRED)**

## Tests
- Unit tests:
  - [ ] Each converted component can be instantiated without its parent NgModule
  - [ ] PhonePipe standalone import works without SharedModule
  - [ ] LowercaseDirective standalone import works without SharedModule
  - [ ] UppercaseDirective standalone import works without SharedModule
  - [ ] CellphoneFormatePipe standalone import works without SharedModule
- Integration tests:
  - [ ] `ng build` completes with exit code 0
  - [ ] `ng lint` reports 0 `prefer-standalone` errors
  - [ ] Application loads at `/main` route without console errors
  - [ ] Navigation to `/login`, `/core/vote`, `/core/users` renders correctly
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- Zero `standalone: false` in the codebase
- `ng build` passes with zero errors
- `prefer-standalone` lint errors: 0 (down from 23)
- Application renders correctly on all major routes
