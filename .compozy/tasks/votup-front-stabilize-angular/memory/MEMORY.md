# Workflow Memory

## Current State
- Tasks 01-05: COMPLETED (standalone conversion, prune, bootstrap, inject, signal-input/output/queries)
- Tasks 06-13: PENDING
- Next: Task 06 (AuthInterceptor → functional interceptor)
- Build: passes, 2.22 MB initial total, main 1.54 MB, lazy core chunk 87 KB
- Lint: 46 problems (2 errors in BaseComponent prefer-inject + 44 warnings no-explicit-any)

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
- `npm test` fails (TS18003 — no .spec.ts files, tsconfig.spec.json issue)
- ng-zorro-antd zoneless compatibility untested (task 12)
- BaseComponent's manual Injector pattern still has 2 prefer-inject errors (task_09)
- VoterComponent @Input() voter incompatible with signal input (task_09/10)

## Handoffs
- Task 06: Convert AuthInterceptor class → authInterceptorFn, then switch to `withInterceptors([authInterceptorFn])` — DONE
- Task 07: Convert AppGuard class → authGuard CanActivateFn — DONE
- Task 08: Refactor BaseService (eliminate any, typed generics, inject(HttpClient))
- Task 09: Refactor BaseComponent (inject(), signal state, eliminate Injector pattern)

## Completed Since Last Memory Update
- Task 11: Deleted 5 dead service files (user.service.ts, candidate.service.ts, voter.service.ts, message.service.ts, resume-voting.ts). Fixed 3 avatar: any → string | Blob | null. Fixed DetailResponse.detail. Removed UserService import from users.component.ts and main.ts provider list. Lint: 28→25 warnings. Build passes.
