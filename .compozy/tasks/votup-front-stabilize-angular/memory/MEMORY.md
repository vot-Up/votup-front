# Workflow Memory

## Current State
- Tasks 01-09 and 11: COMPLETED
- Tasks 10, 12, 13: PENDING
- Next: Task 10 (component local state signals and OnPush)
- Build: passes, 2.22 MB initial total, main 1.54 MB, lazy core chunk 87 KB
- Lint: 25 warnings, 0 errors; BaseService has 0 no-explicit-any warnings; 0 Injector/InjectionToken references under src/app and src/services
- Tests: 35 ChromeHeadless specs pass; coverage Statements 81.27%, Branches 67.61%, Functions 87.15%, Lines 81.36%

## Shared Decisions
- ng-zorro-antd `nzAfterClose` requires `EventEmitter<R>` — keep `modalClosedEmitter` as EventEmitter, not Subject/output()
- `@Input() voter` in VoterComponent kept because it's reassigned programmatically (task_09/10 scope)
- `withInterceptorsFromDi()` kept until task_06 converts AuthInterceptor to functional
- ng-zorro NgModules stay as `importProvidersFrom()` until standalone provider APIs available

## Shared Learnings
- Angular schematics need `NG_DEBUG=1` env var to actually execute (otherwise silently report "Nothing to be done")
- Output schematic removes EventEmitter from imports — must re-add if EventEmitter used for non-@Output purposes
- `output<void>().emit()` requires an argument (use `emit(undefined)`)
- viewChild() migration auto-updates templates from `prop.x` to `prop().x`
- Bundle improved through standalone/lazy: main 1.64MB → 1.54MB, total 2.32MB → 2.22MB

## Open Risks
- `npm test -- --watch=false --browsers=ChromeHeadless --code-coverage` now passes after adding specs
- ng-zorro-antd zoneless compatibility untested (task 12)
- BaseComponent still has some legacy generic/indexing patterns for future tightening, but Injector/InjectionToken removal and signal state are complete
- VoterComponent @Input() voter incompatible with signal input (task_10)

## Handoffs
- Task 06: Convert AuthInterceptor class → authInterceptorFn, then switch to `withInterceptors([authInterceptorFn])` — DONE
- Task 07: Convert AppGuard class → authGuard CanActivateFn — DONE
- Task 08: Refactor BaseService (eliminate any, typed generics, inject(HttpClient)) — DONE
- Task 09: Refactor BaseComponent (inject(), signal state, eliminate Injector pattern) — DONE
- Task 10: Convert local component state to signals and apply OnPush — NEXT

## Completed Since Last Memory Update
- Task 11: Deleted 5 dead service files (user.service.ts, candidate.service.ts, voter.service.ts, message.service.ts, resume-voting.ts). Fixed 3 avatar: any → string | Blob | null. Fixed DetailResponse.detail. Removed UserService import from users.component.ts and main.ts provider list. Lint: 28→25 warnings. Build passes.
- Task 08: BaseService now uses inject(HttpClient), typed HttpRequestOptions/metadata/choice interfaces, typed CRUD/FormData/blob helpers, and BaseService HTTP specs. Build passes; coverage run passes 23 specs with >=80% all reported metrics.
- Task 09: BaseComponent now injects framework services at field level, stores object/tableData/pageLength as signals, creates endpoint services with the injected HttpClient, and has BaseComponent ChromeHeadless tests covering form creation, object/tableData signals, save/update/create FormData, retrieve, search, toggle, createService, and destroy behavior. Manual backend CRUD verification was not available in this harness.
