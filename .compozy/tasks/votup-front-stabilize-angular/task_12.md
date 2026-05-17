---
status: completed
title: Enable zoneless with Zone.js fallback
type: refactor
complexity: high
dependencies:
- task_10
---

# Task 12: Enable zoneless with Zone.js fallback

## Overview
Add `provideExperimentalZoneless()` to the bootstrap providers while keeping Zone.js in the polyfills as a fallback. This enables signals-based change detection alongside Zone.js, allowing incremental validation that all async operations, ng-zorro-antd components, and third-party libraries work correctly without relying solely on Zone.js.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST add `provideExperimentalZoneless()` to the `bootstrapApplication` providers array
- MUST keep `zone.js` in the polyfills configuration in `angular.json` as fallback
- MUST keep `zone.js` in `package.json` dependencies
- MUST verify `ng build` passes with zero errors
- MUST systematically test all interactive components to ensure they still update correctly
- MUST test all async operations: HTTP calls, router navigation, setTimeout/setInterval, form value changes
- MUST test all ng-zorro-antd interactive components: modals, date pickers, dropdowns, selects, tables with pagination, drag-drop
- MUST document any components that fail to update correctly without Zone.js triggering change detection
</requirements>

## Subtasks
- [x] 12.1 Ensure task_10 is complete (all components OnPush + signal-based)
- [x] 12.2 Add zoneless change detection provider to bootstrap providers in `main.ts` (Angular 21 API: `provideZonelessChangeDetection()`)
- [x] 12.3 Verify `ng build` passes
- [ ] 12.4 Test login flow: form input → HTTP POST → navigation to /core/users
- [ ] 12.5 Test CRUD flows: each entity type (users, votes, plates, voters, candidates) — create, edit, delete
- [ ] 12.6 Test modal flows: open modal, interact, close, verify parent updates
- [ ] 12.7 Test ng-zorro-antd date picker: open, select date, form value updates
- [ ] 12.8 Test ng-zorro-antd select/dropdown: open, select option, form value updates
- [ ] 12.9 Test drag-and-drop: PlateItemComponent candidate assignment
- [ ] 12.10 Test pagination: page change triggers table data reload
- [ ] 12.11 Test voting flow (login-elector): phone entry → plate selection → vote → success screen
- [ ] 12.12 Test file upload: UsersItemComponent avatar upload
- [ ] 12.13 Test PDF download: vote report generation
- [ ] 12.14 Document any components that fail to update without Zone.js (add `ɵzoneAgent` or manual `ChangeDetectorRef.detectChanges()` as needed)
- [ ] 12.15 Commit changes with documentation of any issues found

## Implementation Details

With `provideExperimentalZoneless()` + Zone.js both active:
- Angular uses signals for change detection where signals are used (most of our code after task_09 and task_10)
- Zone.js still patches async APIs as a fallback for any code that doesn't use signals
- ng-zorro-antd components that internally rely on Zone.js will still function correctly

Key areas of concern:
- `NzModalService.create()` — modals may use Zone.js internally for animation callbacks
- `NzDatePickerComponent` — may rely on Zone.js for popup state management
- `CdkDragDrop` — may rely on Zone.js for event handling
- `setTimeout()` in VotingComponent.redirect — Zone.js patches this; with zoneless, the signal update after timeout must still trigger change detection
- `AudioElement.play()` — not an Angular concern, but verify it doesn't break rendering

If any component fails to update: add `inject(ChangeDetectorRef)` and call `cdr.detectChanges()` after the async operation that doesn't trigger signal updates. This is a temporary workaround until the component is properly migrated to signals.

### Relevant Files
- `src/main.ts` — add `provideExperimentalZoneless()` to bootstrap providers
- `angular.json` — verify `zone.js` is still in polyfills (no change needed yet)
- All components with async operations that may not use signals

### Dependent Files
- `package.json` — zone.js dependency remains
- All ng-zorro-antd components used in the application

### Related ADRs
- [ADR-004: Zoneless with Zone.js Fallback Strategy](../adrs/adr-004.md) — Decision to adopt zoneless with Zone.js fallback before full removal

## Deliverables
- `provideExperimentalZoneless()` in bootstrap providers
- Zone.js still in polyfills as fallback
- Documentation of any components that require manual change detection workarounds
- `ng build` passes with zero errors
- All interactive flows tested and working
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for zoneless + Zone.js coexistence **(REQUIRED)**

## Tests
- Unit tests:
  - [ ] Bootstrap includes `provideExperimentalZoneless()` in providers
  - [ ] Signal-based component updates trigger change detection without Zone.js
  - [ ] Components with `OnPush` + signals re-render correctly
- Integration tests:
  - [ ] `ng build` completes with exit code 0
  - [ ] Login flow: form → HTTP → redirect works
  - [ ] CRUD flows: all entity types render and update correctly
  - [ ] Modal open/close/submit flows work
  - [ ] Date picker opens and selects values correctly
  - [ ] Drag-and-drop plate assignment works
  - [ ] Pagination page changes reload data
  - [ ] Voting flow: phone → select plate → vote → success renders
  - [ ] File upload (avatar) triggers re-render
  - [ ] PDF download triggers without rendering issues
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- `provideExperimentalZoneless()` present in bootstrap
- Zone.js still in polyfills and package.json
- All interactive flows work correctly (documented any workarounds)
- `ng build` passes with zero errors
