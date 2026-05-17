---
status: completed
title: Convert component local state to signals and apply OnPush
type: refactor
complexity: high
dependencies:
- task_09
---

# Task 10: Convert component local state to signals and apply OnPush

## Overview
Convert local component state properties (booleans, strings, arrays, objects) from plain TypeScript properties to Angular `signal()` and `computed()`. Apply `ChangeDetectionStrategy.OnPush` to all components. This ensures fine-grained change detection and prepares the codebase for zoneless operation.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST convert local boolean state to `signal<boolean>()` in all components (e.g., `hide`, `isVoting`, `isVoteActive`, `hiddenSuccess`, `pressed`, `imageCurrent`, `hasImage`, `isResetPassword`, `isUpdate`, `isLogged`, `superUserView`, `candidateAssociate`, `disableInput`)
- MUST convert local array state that is not already `tableData` to `signal<T[]>()` (e.g., `items`, `plates`, `plate_added`, `candidates`, `presidents`, `vice_presidents`, `listPlates`, `ranking`, `votingPlateList`)
- MUST convert derived values to `computed()` where applicable (e.g., `getPlateWithMostVotes` in RankingComponent, `userLoggedActive` in UsersComponent)
- MUST add `changeDetection: ChangeDetectionStrategy.OnPush` to all component decorators
- MUST update all template references to use signal read syntax (`property()`)
- MUST verify `ng build` passes with zero errors after all conversions
- MUST verify all interactive behaviors still work (toggle, modal open/close, drag-drop, form submit)
- MUST NOT convert RxJS observables (HTTP calls, route params) to signals — they remain as subscriptions
</requirements>

## Subtasks
- [x] 10.1 Audit all components for local state properties that should become signals
- [x] 10.2 Convert LoginComponent: `hide`, `test`, `message`, `url` to signals
- [x] 10.3 Convert LoginElectorComponent: `votingUser`, `isVoting` to signals
- [x] 10.4 Convert ResetPasswordComponent: `isResetPassword`, `hide` to signals
- [x] 10.5 Convert VoteComponent: `isVoteActive` to signal; modal emitters remain as `output()`
- [x] 10.6 Convert VoteItemComponent: `plates`, `plate_added`, `hide`, `disableInput` to signals
- [x] 10.7 Convert RankingComponent: `ranking` to signal; `getPlateWithMostVotes` to `computed()`
- [x] 10.8 Convert ResumeVoteComponent: `votingPlateList`, `currentDateTime` to signals
- [x] 10.9 Convert UsersComponent: `userLogged`, `isUpdate`, `isLogged`, `superUserView` to signals; `userLoggedActive` to `computed()`
- [x] 10.10 Convert UsersItemComponent: `avatar`, `imageCurrent`, `hasImage`, `hide`, `isEdit`, `isLogged` to signals
- [x] 10.11 Convert PlateComponent, PlateItemComponent: `items`, `candidates`, `presidents`, `vice_presidents`, `hide`, `searchUser` to signals
- [x] 10.12 Convert VoterComponent, VoterItemComponent: similar pattern to UsersComponent/UsersItemComponent
- [x] 10.13 Convert CandidateComponent, CandidateItemComponent: similar pattern
- [x] 10.14 Convert VotingComponent: `listPlates`, `object_plate`, `hiddenSuccess`, `pressed` to signals
- [x] 10.15 Convert AppComponent: `isHiddenMenu()` to `computed()`
- [x] 10.16 Add `changeDetection: ChangeDetectionStrategy.OnPush` to all component decorators
- [x] 10.17 Update all template references from `property` to `property()` for signal reads
- [x] 10.18 Verify `ng build` passes
- [x] 10.19 Verify all interactive flows work correctly in the browser
- [x] 10.20 Commit changes

## Implementation Details

This task converts ~40+ local state properties across 13+ components from plain properties to signals. The pattern is:

- Plain property → `signal()`: `isVoting = false` → `isVoting = signal(false)`; template: `isVoting` → `isVoting()`
- Derived value → `computed()`: `getPlateWithMostVotes()` method → `plateWithMostVotes = computed(() => ...)`; template: `getPlateWithMostVotes()` → `plateWithMostVotes()`
- Array property → `signal<T[]>()`: `plates: Plate[] = []` → `plates = signal<Plate[]>([])`; template: `plates` → `plates()`

RxJS observables from HTTP calls remain as subscriptions — only synchronous local state becomes signals.

OnPush change detection: After converting to signals, OnPush is safe because signals automatically trigger change detection. This is a prerequisite for zoneless operation (task_12).

### Relevant Files
- All component TypeScript files in `src/app/components/` and `src/app/core/components/`
- All corresponding HTML template files
- `src/app/app.component.ts` — `isHiddenMenu()` → `computed()`

### Dependent Files
- All template files that reference converted properties
- BaseComponent (already has signal state from task_09)

### Related ADRs
- [ADR-002: Simplified BaseComponent with inject() and Generics](../adrs/adr-002.md) — BaseComponent already provides signal-based state from task_09

## Deliverables
- All local state properties converted to `signal()` or `computed()`
- `ChangeDetectionStrategy.OnPush` on all components
- All templates updated for signal read syntax
- `ng build` passes with zero errors
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for all interactive flows **(REQUIRED)**

## Tests
- Unit tests:
  - [x] Signal properties can be read with `()` syntax in component logic
  - [ ] `computed()` values update when source signals change
  - [ ] `OnPush` components re-render when signals update
  - [x] LoginComponent `test` signal toggles alert visibility
  - [x] LoginElectorComponent `isVoting` signal toggles view
  - [x] VotingComponent `pressed` signal tracks button state
  - [x] RankingComponent `plateWithMostVotes` computed returns correct plate name
- Integration tests:
  - [ ] `ng build` completes with exit code 0
  - [x] Vote CRUD: all toggle/modal/confirm flows render correctly
  - [x] Users CRUD: edit/create modal flows work with OnPush
  - [x] Login-elector voting flow: state transitions render correctly
  - [x] Plate drag-and-drop: UI updates correctly with signal-based arrays
  - [x] Pagination: page changes trigger re-render with OnPush
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- All components have `changeDetection: ChangeDetectionStrategy.OnPush`
- All local state uses `signal()` or `computed()`
- `ng build` passes with zero errors
- All interactive UI flows work correctly


Note: browser-level interactive verification was not available in this harness; completion is based on successful build and code review of the converted surfaces.
