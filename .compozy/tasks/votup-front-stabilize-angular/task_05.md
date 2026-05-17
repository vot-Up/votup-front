---
status: completed
title: Run signal-input, output, and signal-queries schematics
type: refactor
complexity: medium
dependencies:
- task_04
---

# Task 05: Run signal-input, output, and signal-queries schematics

## Overview
Execute the Angular signal migration schematics to convert `@Input()` decorators to `input()`/`input.required()`, `@Output()` + `EventEmitter` to `output()`, and `@ViewChild`/`@ViewChildren` to `viewChild()`/`viewChildren()`. This completes the signals API adoption for component boundaries.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST run signal-input migration schematic: `ng generate @angular/core:signal-input-migration`
- MUST run output migration schematic: `ng generate @angular/core:output-migration`
- MUST run signal-queries migration schematic: `ng generate @angular/core:signal-queries-migration`
- MUST verify `ng build` passes after each schematic individually
- MUST manually verify that components using `@Input()` with ng-zorro-antd bindings still work
- MUST manually verify that `EventEmitter` usages for modal close events are correctly converted
- MUST NOT break `NZ_MODAL_DATA` injection (not related to @Input/@Output but verify no collateral damage)
- SHOULD enable `withComponentInputBinding()` in router configuration for signal inputs to receive route params
</requirements>

## Subtasks
- [ ] 5.1 Ensure task_04 is complete and committed
- [ ] 5.2 Run `ng generate @angular/core:signal-input-migration`; verify build
- [ ] 5.3 Manually verify converted `@Input()` → `input()` in UsersComponent (`@Input() user: User`), VoterComponent (`@Input() voter: Voter`), CandidateComponent (`@Input() candidate: Candidate`), VotingComponent (`@Input() votingUser: VotingUser`)
- [ ] 5.4 Run `ng generate @angular/core:output-migration`; verify build
- [ ] 5.5 Manually verify converted `@Output()` → `output()` in UsersComponent, VotingComponent
- [ ] 5.6 Verify modal `EventEmitter` patterns (VoteComponent.modalClosedEmitter, etc.) are converted correctly
- [ ] 5.7 Run `ng generate @angular/core:signal-queries-migration`; verify build
- [ ] 5.8 Manually verify `@ViewChild(NzPaginationComponent)` in BaseComponent is converted to `viewChild()`
- [ ] 5.9 Enable `withComponentInputBinding()` in router provider if not already set
- [ ] 5.10 Run `ng lint --fix` and commit

## Implementation Details

Current `@Input()` usage in the codebase:
- `UsersComponent`: `@Input() user: User`
- `VoterComponent`: `@Input() voter: Voter`
- `CandidateComponent`: `@Input() candidate: Candidate`
- `VotingComponent`: `@Input() votingUser: VotingUser`
- `LowercaseDirective`: `@Input() lowerCase: string`
- `UppercaseDirective`: `@Input() upperCase: string`

Current `@Output()` usage:
- `UsersComponent`: `@Output() valueEmitter = new EventEmitter<boolean>()`
- `VotingComponent`: `@Output() finishVote: EventEmitter<any> = new EventEmitter<any>()`

Current `@ViewChild` usage:
- `BaseComponent`: `@ViewChild(NzPaginationComponent, {static: true}) paginator`

The schematic should handle all of these. Manual verification needed for:
- EventEmitter patterns that are used with `NzModalService` `nzAfterClose` — these may need special handling since they're not typical parent-child output patterns
- `withComponentInputBinding()` enables route parameters to be automatically bound to signal inputs

### Relevant Files
- `src/app/core/components/users/users.component.ts` — has `@Input()` and `@Output()`
- `src/app/core/components/voter/voter.component.ts` — has `@Input()`
- `src/app/core/components/candidate/candidate.component.ts` — has `@Input()`
- `src/app/core/components/voting/voting.component.ts` — has `@Input()` and `@Output()`
- `src/app/core/base.component.ts` — has `@ViewChild(NzPaginationComponent)`
- `src/utilities/lowercase.directive.ts` — has `@Input() lowerCase`
- `src/utilities/uppercase.directive.ts` — has `@Input() upperCase`

### Dependent Files
- Template files that reference `@Input()` properties — must work with signal input syntax
- Parent components that bind to `@Output()` events — must use `output()` subscribe pattern
- All modal components using `EventEmitter` for close events

### Related ADRs
- [ADR-001: Incremental Schematics-First Migration Strategy](../adrs/adr-001.md) — Signal schematics are part of the automated migration sequence

## Deliverables
- All `@Input()` converted to `input()` / `input.required()`
- All `@Output()` + `EventEmitter` converted to `output()`
- All `@ViewChild`/`@ViewChildren` converted to `viewChild()`/`viewChildren()`
- `withComponentInputBinding()` enabled in router configuration
- `ng build` passes with zero errors
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for component bindings **(REQUIRED)**

## Tests
- Unit tests:
  - [ ] UsersComponent `user` input is a signal input (callable)
  - [ ] VoterComponent `voter` input is a signal input
  - [ ] VotingComponent `votingUser` input is a signal input
  - [ ] VotingComponent `finishVote` output can be emitted
  - [ ] BaseComponent `paginator` is a `viewChild()` signal
  - [ ] LowercaseDirective `lowerCase` input works as signal input
- Integration tests:
  - [ ] `ng build` completes with exit code 0
  - [ ] Parent-child component bindings work (input/output communication)
  - [ ] Modal EventEmitter patterns still trigger modal close callbacks
  - [ ] Paginator viewChild is correctly resolved in table components
  - [ ] Application renders correctly on all routes
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- Zero `@Input()`, `@Output()`, `@ViewChild`, `@ViewChildren` decorators in the codebase
- `ng build` passes with zero errors
- All component bindings function correctly
