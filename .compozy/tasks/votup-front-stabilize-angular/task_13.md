---
status: pending
title: "Full zoneless: remove Zone.js, optimize bundle, final lint cleanup"
type: refactor
complexity: high
dependencies:
- task_12
---

# Task 13: Full zoneless: remove Zone.js, optimize bundle, final lint cleanup

## Overview
Remove Zone.js entirely from the application after validating zoneless operation in task_12. Optimize the bundle size by adjusting angular.json budgets and removing unused dependencies. Achieve zero lint errors and zero warnings — the final state of the modernization initiative.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST remove `zone.js` from polyfills in `angular.json`
- MUST remove `zone.js` (~0.16.0) from `package.json` dependencies
- MUST run `npm install` to update package-lock.json after removing zone.js
- MUST replace `provideExperimentalZoneless()` with the stable zoneless API if available in Angular 21.2+, or keep it if still experimental
- MUST remove any `ChangeDetectorRef.detectChanges()` workarounds added in task_12 (replace with proper signal-based patterns)
- MUST reduce angular.json production budgets from 5MB to an appropriate target (e.g., 2MB initial, 500KB component styles)
- MUST verify `ng build` passes with zero errors
- MUST verify `ng lint` reports zero errors and zero warnings
- MUST verify the production bundle size is reduced from the current 1.64MB main chunk
- MUST verify all application flows work correctly without Zone.js
- MUST remove any remaining `import { Zone }` or zone-related imports
</requirements>

## Subtasks
- [x] 13.1 Ensure task_12 is complete and all zoneless issues are resolved
- [x] 13.2 Remove `zone.js` from polyfills in `angular.json`
- [x] 13.3 Remove `zone.js` from `package.json` dependencies
- [x] 13.4 Run `npm install` to update lock file
- [x] 13.5 Keep the stable zoneless API in `main.ts` (`provideZonelessChangeDetection()`)
- [x] 13.6 Remove any manual `ChangeDetectorRef.detectChanges()` workarounds
- [x] 13.7 Update angular.json budgets: reduce initial maximumWarning and maximumError
- [x] 13.8 Run `ng build` and verify bundle size reduction
- [x] 13.9 Run `ng lint` and fix any remaining errors/warnings to reach zero
- [ ] 13.10 Run final comprehensive manual testing of all application flows
- [x] 13.11 Verify Zone.js is not in the production bundle (check dist/ output)
- [ ] 13.12 Commit final state

## Implementation Details

After removing Zone.js:
- The polyfills array in `angular.json` should be empty or contain only non-zone polyfills
- The `zone.js/testing` import in `tsconfig.spec.json` should also be removed
- Bundle size should decrease since zone.js (~15KB gzipped) is no longer included
- Change detection relies entirely on Angular signals — all component state must be signal-based (verified in task_10)

Budget recommendations for Angular 21 with ng-zorro-antd:
- Initial: `maximumWarning: 2mb`, `maximumError: 3mb` (down from 5mb/5mb)
- Component styles: `maximumWarning: 500kb`, `maximumError: 1mb` (down from 2mb/5mb)

Final lint cleanup targets:
- `no-explicit-any` warnings: eliminate remaining instances (models fixed in task_11, BaseService in task_08)
- `no-unused-vars` warnings: fix the 2 known instances (`e` in auth.interceptor.ts and custom-validators.ts)
- Any other remaining warnings

### Relevant Files
- `angular.json` — remove zone.js from polyfills, reduce budgets
- `package.json` — remove zone.js dependency
- `tsconfig.spec.json` — remove `zone.js/testing` from polyfills
- `src/main.ts` — update zoneless provider API if stable version available
- Any files with remaining lint warnings

### Dependent Files
- All component files — must work without Zone.js
- `dist/votup/` — production bundle should not contain zone.js

### Related ADRs
- [ADR-004: Zoneless with Zone.js Fallback Strategy](../adrs/adr-004.md) — This task completes the zoneless migration by removing the fallback

## Deliverables
- Zone.js removed from polyfills, package.json, and production bundle
- Angular.json budgets reduced to appropriate targets
- `ng lint` reports zero errors and zero warnings
- Production bundle size reduced from 1.64MB main chunk
- All application flows work correctly without Zone.js
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for full zoneless operation **(REQUIRED)**

## Tests
- Unit tests:
  - [ ] No `zone.js` import exists in the codebase (`grep -r "zone.js" src/ angular.json package.json`)
  - [ ] Bootstrap providers include zoneless configuration
  - [ ] No `ChangeDetectorRef.detectChanges()` calls remain in the codebase
- Integration tests:
  - [ ] `ng build` completes with exit code 0
  - [ ] Production bundle does not contain zone.js (`grep -r "zone" dist/votup/` returns no results)
  - [ ] `ng lint` reports 0 errors and 0 warnings
  - [ ] Login flow works without Zone.js
  - [ ] All CRUD flows work without Zone.js
  - [ ] Modal flows work without Zone.js
  - [ ] Date picker works without Zone.js
  - [ ] Drag-and-drop works without Zone.js
  - [ ] Pagination works without Zone.js
  - [ ] Voting flow works without Zone.js
  - [ ] File upload works without Zone.js
  - [ ] PDF download works without Zone.js
  - [ ] Main bundle size < 1.2MB (down from 1.64MB)
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- Lint errors: 0 (down from 97)
- Lint warnings: 0 (down from 51)
- Zone.js not in production bundle
- Main bundle size < 1.2MB (down from 1.64MB)
- `ng build` passes with zero errors
- All application flows work correctly

## Progress Notes
- Build and lint are clean after removing Zone.js and tightening budgets.
- Browser-level manual flow testing is still unavailable in this harness.
