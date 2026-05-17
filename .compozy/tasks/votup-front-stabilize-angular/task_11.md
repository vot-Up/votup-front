---
status: pending
title: Clean up dead service files and model `any` types
type: chore
complexity: low
dependencies:
- task_04
---

# Task 11: Clean up dead service files and model `any` types

## Overview
Remove dead/unused service files from `src/services/` that contain empty shell classes, and fix `any` types in model files. These dead services duplicate names with the actual BaseService-based services and create confusion. Model `any` types (avatar fields, DetailResponse.detail) need proper typing.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST delete `src/services/user.service.ts` — empty shell class `UserService` with no methods (the real user operations use BaseService via BaseComponent)
- MUST delete `src/services/candidate.service.ts` — empty shell class `CandidateService`
- MUST delete `src/services/voter.service.ts` — empty shell class (note: it's misnamed as `UserService` inside, another reason to delete)
- MUST delete `src/services/message.service.ts` — unused `MessageService` wrapper
- MUST delete `src/services/resume-voting.ts` — unused `ResumeVoting` shell class
- MUST fix `any` types in model files: `Candidate.avatar`, `User.avatar`, `Voter.avatar` → `string | Blob | null`
- MUST fix `DetailResponse.detail` from `any` to `string | Record<string, string[]>`
- MUST verify no other files import from the deleted service files
- MUST verify `ng build` passes with zero errors
</requirements>

## Subtasks
- [ ] 11.1 Search codebase for imports of each dead service file to confirm they are unused
- [ ] 11.2 Delete `src/services/user.service.ts`
- [ ] 11.3 Delete `src/services/candidate.service.ts`
- [ ] 11.4 Delete `src/services/voter.service.ts`
- [ ] 11.5 Delete `src/services/message.service.ts`
- [ ] 11.6 Delete `src/services/resume-voting.ts`
- [ ] 11.7 Fix `avatar: any` → `avatar: string | Blob | null` in Candidate, User, Voter models
- [ ] 11.8 Fix `DetailResponse.detail: any` → proper type
- [ ] 11.9 Verify `ng build` passes with zero errors
- [ ] 11.10 Run `ng lint` and verify reduced warning count
- [ ] 11.11 Commit changes

## Implementation Details

The dead service files are:
- `src/services/user.service.ts`: contains `UserService` with only a `users: IUser = { loading: false }` property — never used
- `src/services/candidate.service.ts`: contains `CandidateService` with only a `candidates: ICandidates = { loading: false }` property — never used
- `src/services/voter.service.ts`: misnamed `UserService` with only a `voters: IVoter = { loading: false }` property — never used
- `src/services/message.service.ts`: `MessageService` wrapper around `NzMessageService` — never injected anywhere (components use `NzMessageService` directly)
- `src/services/resume-voting.ts`: `ResumeVoting` with only `eventsVoting: IEventVoting = { loading: false }` property — never used

Note: `src/services/auth.service.ts` and `src/services/base.service.ts` are NOT dead — they are actively used.

### Relevant Files
- `src/services/user.service.ts` — delete
- `src/services/candidate.service.ts` — delete
- `src/services/voter.service.ts` — delete
- `src/services/message.service.ts` — delete
- `src/services/resume-voting.ts` — delete
- `src/models/core/candidate.ts` — fix `avatar: any`
- `src/models/core/user.ts` — fix `avatar: any`
- `src/models/core/voter.ts` — fix `avatar: any` (inherits pattern)
- `src/dto/detail-response.ts` — fix `detail: any`

### Dependent Files
- Any file that imports from the deleted services (must be verified as zero)

### Related ADRs

## Deliverables
- 5 dead service files deleted
- 3 model `avatar: any` types fixed to `string | Blob | null`
- `DetailResponse.detail` typed properly
- `ng build` passes with zero errors
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for build **(REQUIRED)**

## Tests
- Unit tests:
  - [ ] No file imports from `user.service.ts`, `candidate.service.ts`, `voter.service.ts`, `message.service.ts`, or `resume-voting.ts`
  - [ ] `Candidate.avatar` is typed as `string | Blob | null`
  - [ ] `User.avatar` is typed as `string | Blob | null`
  - [ ] `DetailResponse.detail` is typed as `string | Record<string, string[]>`
- Integration tests:
  - [ ] `ng build` completes with exit code 0
  - [ ] Application loads and functions correctly without the deleted files
  - [ ] `ng lint` warning count decreased
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- 5 dead service files removed from `src/services/`
- `no-explicit-any` warnings reduced by at least 4 (3 avatar + 1 DetailResponse)
- `ng build` passes with zero errors
- No references to deleted service files in the codebase
