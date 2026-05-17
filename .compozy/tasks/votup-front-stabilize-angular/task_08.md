---
status: pending
title: "Refactor BaseService: eliminate `any`, add typed generics, use `inject()`"
type: refactor
complexity: high
dependencies:
- task_04
---

# Task 08: Refactor BaseService: eliminate `any`, add typed generics, use `inject()`

## Overview
Refactor `BaseService<T>` to eliminate all `any` types, add proper generic typing to all methods, and use `inject()` for HttpClient. This is the foundational service layer that all CRUD components depend on, and it currently has 14 `no-explicit-any` warnings.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST replace `inject(HttpClient)` for HttpClient (constructor injection already converted by task_04 schematic)
- MUST eliminate all `any` types from method signatures and return types
- MUST type `getOptions()` return value as `HttpRequestOptions` (define a proper interface)
- MUST type `addParameter(key: string, value: any)` → `addParameter(key: string, value: string | number | boolean)`
- MUST type `delete(id: number | string): Observable<void>` instead of `Observable<any>`
- MUST type `update(id: number | string, entity: any): Observable<T>` instead of `Observable<any>`
- MUST type `options()` return value properly instead of `Observable<any>`
- MUST type `getChoices(field: string)` return value properly
- MUST type `saveOrUpdateFormData` and `updateWithFormData` properly
- MUST type `deleteFromListRoute<K>` properly instead of `model: any`
- MUST type `loadFile` and `getFileFromListRoute` responses as `Observable<Blob>`
- MUST preserve all existing method signatures and behavior — only types change
- MUST verify `ng build` passes with zero errors after refactoring
- MUST verify `no-explicit-any` warnings in BaseService drop from 14 to 0
</requirements>

## Subtasks
- [ ] 8.1 Define `HttpRequestOptions` interface to replace untyped `getOptions()` return
- [ ] 8.2 Type `addParameter` value parameter as `string | number | boolean`
- [ ] 8.3 Type `delete` return as `Observable<void>`
- [ ] 8.4 Type `update` entity parameter as `Partial<T>` instead of `any`
- [ ] 8.5 Type `deleteFromListRoute` model parameter as `Record<string, unknown>` or specific type
- [ ] 8.6 Type `options()` return as `Observable<Record<string, ActionMetadata>>` (or similar)
- [ ] 8.7 Type `getChoices` return as `Observable<Choice[]>` (or similar)
- [ ] 8.8 Type `saveWithFormData` and `updateWithFormData` properly
- [ ] 8.9 Type `loadFile` data parameter
- [ ] 8.10 Remove `HttpUserEvent` tap casts (they add no value and force `any` casting)
- [ ] 8.11 Verify `ng build` passes
- [ ] 8.12 Verify `ng lint` shows 0 `no-explicit-any` warnings in base.service.ts
- [ ] 8.13 Commit changes

## Implementation Details

The current `BaseService` has ~260 lines with 14 `any` usages. The refactoring is purely type-level — no behavioral changes. Key patterns:

1. `getOptions()` currently returns an untyped object with optional `headers`, `params`, `responseType` — define an interface for this.
2. `HttpUserEvent<T>` taps throughout are unnecessary and create `any` casts — remove them.
3. `catchError(ex => from([]))` swallows errors silently — this behavior should be preserved but typed correctly.
4. Django REST Framework `options()` endpoint returns action metadata with `POST` field containing field choices — type this as a known structure.

See TechSpec "Core Interfaces" section for the `BaseService` pattern.

### Relevant Files
- `src/services/base.service.ts` — primary file to refactor (14 `any` warnings)
- `src/dto/paginated-result.ts` — already properly typed, reference for pattern
- `src/dto/detail-response.ts` — currently has `any`, should be typed as part of this task

### Dependent Files
- `src/app/core/base.component.ts` — extends BaseService usage, must compile with new types
- All components that call BaseService methods — must compile with new signatures
- `src/services/auth.service.ts` — extends BaseService pattern for auth-specific calls

### Related ADRs
- [ADR-001: Incremental Schematics-First Migration Strategy](../adrs/adr-001.md) — BaseService refactoring is part of Phase 2 structural refactoring

## Deliverables
- `BaseService<T>` with zero `any` types
- `HttpRequestOptions` interface defined
- `DetailResponse.detail` typed properly
- `ng build` passes with zero errors
- `no-explicit-any` warnings in base.service.ts: 0 (down from 14)
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for HTTP operations **(REQUIRED)**

## Tests
- Unit tests:
  - [ ] `getAll<T>()` returns `Observable<T[]>` with correct typing
  - [ ] `getPaginated<T>()` returns `Observable<PaginatedResult<T>>` with correct typing
  - [ ] `save(entity: T)` accepts `T` and returns `Observable<T>`
  - [ ] `update(id, entity: Partial<T>)` accepts partial entity and returns `Observable<T>`
  - [ ] `delete(id)` returns `Observable<void>`
  - [ ] `addParameter` accepts `string | number | boolean` values only
  - [ ] `loadFile` returns `Observable<Blob>`
  - [ ] `deleteFromListRoute` model parameter is typed (not `any`)
- Integration tests:
  - [ ] `ng build` completes with exit code 0
  - [ ] All components that extend BaseComponent compile against the refactored BaseService
  - [ ] Application loads and makes HTTP requests correctly
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- Zero `any` types in `base.service.ts`
- `ng build` passes with zero errors
- `no-explicit-any` lint warnings in base.service.ts: 0 (down from 14)
- All component code that depends on BaseService compiles without type errors
