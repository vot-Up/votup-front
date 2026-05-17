# TechSpec: VotUp Front — Angular 21 Stabilization & Modernization

## Executive Summary

This specification details the implementation of a phased migration of the votup-front Angular application from legacy NgModule architecture to Angular 21's modern patterns: standalone components, `inject()` dependency injection, signals-first reactivity, functional HTTP interceptors, functional route guards, and zoneless change detection with Zone.js fallback.

The primary technical trade-off is between automation speed (Angular schematics handle bulk conversion) and manual precision (refactoring BaseComponent/BaseService requires hand-crafted changes). The chosen approach maximizes schematic automation first, then applies targeted manual refactoring — accepting mixed legacy/modern code in intermediate phases to achieve zero lint errors faster.

## System Architecture

### Component Overview

| Component | Responsibility | Migration Impact |
|-----------|---------------|-----------------|
| `main.ts` | Application bootstrap | Rewrite: `bootstrapModule` → `bootstrapApplication` with standalone providers |
| `AppModule` | Root NgModule, providers, declarations | **Delete** — replaced by `bootstrapApplication` providers |
| `CoreModule` | Feature NgModule with lazy routes | **Delete** — replaced by lazy-loaded routes with standalone components |
| `SharedModule` | Shared pipes/directives declarations | **Delete** — pipes/directives become standalone |
| `AppRoutingModule` | Root route definitions | **Modify** — functional guards, standalone component references |
| `CoreRoutingModule` | Feature route definitions | **Modify** — remove `RouterModule.forChild`, direct component imports |
| `AppComponent` | Root shell component | **Modify** — standalone, signals, `inject()` |
| `BaseComponent<T>` | Abstract CRUD/pagination base class | **Major refactor** — replace Injector pattern with `inject()`, typed generics |
| `BaseService<T>` | Generic HTTP CRUD service | **Major refactor** — eliminate `any`, typed generics, `inject(HttpClient)` |
| `AuthInterceptor` | HTTP auth header + error handling | **Rewrite** — functional interceptor with `inject()` |
| `AppGuard` | Route authentication guard | **Rewrite** — functional guard `authGuardFn` |
| `AuthService` | JWT login/logout/token management | **Modify** — `inject()`, signal-based user state |
| 13 Feature Components | CRUD screens (votes, users, plates, voters, candidates) | **Modify** — standalone, signals for local state, `inject()`, `input()`/`output()` |
| 3 Pipes/Directives | PhonePipe, LowercaseDirective, UppercaseDirective, CellphoneFormatePipe | **Modify** — standalone: true (remove `standalone: false`) |

### Data Flow (Post-Migration)

```
bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptorFn])),
    provideAnimations(),
    provideExperimentalZoneless(),
    importProvidersFrom(NzMessageServiceModule),  // if not yet standalone
  ]
})
    ↓
AppComponent (standalone)
    ↓ Router
Lazy Feature Routes → Standalone Components
    ↓ inject()
BaseService<T> → Django REST API (unchanged endpoints)
    ↓ signals
Component State → Template (@if/@for bindings)
```

## Implementation Design

### Core Interfaces

**BaseComponent (simplified)** — the primary type that all CRUD components depend on:

```typescript
@Directive()
export abstract class BaseComponent<T extends ModelBase> {
  protected readonly service = inject<BaseService<T>>(BaseService);
  protected readonly router = inject(Router);
  protected readonly formBuilder = inject(FormBuilder);
  protected readonly activatedRoute = inject(ActivatedRoute);

  object = signal<T>({} as T);
  tableData = signal<T[]>([]);
  formGroup: FormGroup;
  unsubscribe = new Subject<void>();

  abstract createFormGroup(): void;
  saveOrUpdate(callback?: () => void): void { ... }
  search(callback?: () => void): void { ... }
  retrieve(callback?: () => void): void { ... }
}
```

**BaseService (typed)** — the primary HTTP service type:

```typescript
@Injectable({ providedIn: 'root' })
export class BaseService<T> {
  private readonly http = inject(HttpClient);
  private readonly urlBase = environment.urlBase;
  private parameters = new HttpParams();
  private token: string | null = null;

  constructor(private path: string) { this.fullUrl = `${this.urlBase}${path}`; }

  getAll(route?: string): Observable<T[]> { ... }
  getPaginated(route?: string): Observable<PaginatedResult<T>> { ... }
  save(entity: T): Observable<T> { ... }
  update(id: number | string, entity: Partial<T>): Observable<T> { ... }
  delete(id: number | string): Observable<void> { ... }
}
```

**Functional Auth Interceptor**:

```typescript
export const authInterceptorFn: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const toast = inject(NzMessageService);
  const token = localStorage.getItem('token');
  const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
  return next(authReq).pipe(tap({ error: (err) => handleAuthError(err, authService, toast) }));
};
```

**Functional Route Guard**:

```typescript
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if (authService.isLoggedIn()) return true;
  authService.logout(false, true);
  return false;
};
```

### Data Models

Existing models remain structurally unchanged — they are plain TypeScript classes extending `ModelBase`. The only change is removing `any` types where present:

| Model | Current Issue | Fix |
|-------|--------------|-----|
| `Candidate.avatar` | `any` | `string \| Blob` |
| `User.avatar` | `any` | `string \| Blob` |
| `Voter.avatar` (inherits from Candidate pattern) | `any` | `string \| Blob` |
| `DetailResponse.detail` | `any` | `string \| Record<string, string[]>` |

Model classes remain class-based (not interfaces) since they have default values and the `ModelBase` base class. No conversion to interfaces needed.

### API Endpoints

No changes to API integration. The `URLS` constant and `BaseService` methods preserve the existing endpoint structure:

- `POST /api/account/token/` — login
- `GET/POST/PATCH/DELETE /api/votup/voter/` — voters
- `GET/POST/PATCH/DELETE /api/votup/candidate/` — candidates
- `GET/POST/PATCH/DELETE /api/votup/plate/` — plates
- `GET/POST/PATCH/DELETE /api/votup/voting/` — votings
- Plus sub-routes: `voting/{id}/ranking/`, `voting/{id}/close_vote/`, `voting/{id}/active_vote/`, etc.

## Integration Points

### ng-zorro-antd (v21.2.2)

- All ng-zorro module imports (NzTableModule, NzModalModule, NzFormModule, etc.) convert to standalone component/directive imports
- `NzModalService.create()` continues to work with standalone content components — `nzContent` accepts standalone components directly
- `NZ_MODAL_DATA` injection token continues to work for modal data passing
- `NzMessageService` remains injectable via `inject()`
- **Zoneless concern**: ng-zorro-antd may rely on Zone.js for internal change detection in some components (modals, dropdowns, date pickers). The Zone.js fallback strategy (ADR-004) mitigates this.

### ngx-mask (v21.0.1)

- `NgxMaskDirective` is already standalone-compatible
- `provideNgxMask()` moves from NgModule providers to `bootstrapApplication` providers

### Django REST Framework Backend

- No changes to API contracts
- `Accept-Language: pt-BR` header continues to be set by the auth interceptor
- JWT token handling remains in localStorage with `Bearer` prefix

## Impact Analysis

| Component | Impact Type | Description and Risk | Required Action |
|-----------|-------------|---------------------|-----------------|
| `main.ts` | **Modified** | Bootstrap method changes entirely | Rewrite to `bootstrapApplication` with standalone providers |
| `AppModule` | **Deprecated** | Entire NgModule removed | Delete file, move providers to bootstrap |
| `CoreModule` | **Deprecated** | Feature NgModule removed | Delete file, convert routes to standalone |
| `SharedModule` | **Deprecated** | Shared NgModule removed | Delete file, pipes/directives become standalone |
| `AppRoutingModule` | **Modified** | Route config uses functional guards | Convert class guards to functions, remove module pattern |
| `CoreRoutingModule` | **Modified** | Remove `RouterModule.forChild` | Export routes array directly for lazy loading |
| `BaseComponent<T>` | **Major Refactor** | Core pattern for 13+ components | Replace Injector pattern with `inject()`, add signal-based state |
| `BaseService<T>` | **Major Refactor** | Eliminate `any`, typed generics | Type all methods, use `inject(HttpClient)` |
| `AuthInterceptor` | **Rewrite** | Class → functional interceptor | Convert to `HttpInterceptorFn` |
| `AppGuard` | **Rewrite** | Class → functional guard | Convert to `CanActivateFn` |
| `AuthService` | **Modified** | Constructor → `inject()`, signal user | Add `inject()`, convert user to signal |
| `AppComponent` | **Modified** | Standalone, inject, signals | Remove `standalone: false`, add `inject()` |
| 13 Feature Components | **Modified** | Standalone, signals, inject, input/output | Schematic-automated + manual signal conversion |
| 4 Pipes/Directives | **Modified** | Remove `standalone: false` | Schematic-automated |
| `angular.json` | **Modified** | Remove Zone.js polyfill, adjust budgets | Drop `zone.js` from polyfills, reduce budget |
| `package.json` | **Modified** | Remove `zone.js` dependency (Phase 3) | `npm uninstall zone.js` |

## Testing Approach

### Unit Tests
- **Not in scope** — the PRD explicitly excludes adding tests. The codebase currently has zero `.spec.ts` files.
- **Recommendation**: After Phase 1, add minimal smoke tests for `BaseService` HTTP methods and `AuthService` login/logout flow to provide a safety net for Phases 2 and 3.

### Manual Verification
After each schematic run and each phase:
1. Run `ng build` — must pass with zero errors
2. Run `ng lint` — track error/warning count reduction
3. Run `ng serve` and manually test each route:
   - `/main` — landing page loads
   - `/login` — login form submits, JWT token stored
   - `/core/users` — user CRUD (list, create, edit, delete)
   - `/core/vote` — voting CRUD, modal create/edit, ranking
   - `/core/voters` — voter CRUD
   - `/core/candidates` — candidate CRUD
   - `/core/candidate_group` — plate CRUD, drag-and-drop candidate assignment
   - `/login-elector` — voter login and voting flow
   - `/reset-password` — password reset flow

## Development Sequencing

### Build Order

1. **Standalone Schematic Step 1: Convert declarations to standalone** — no dependencies
   - `ng generate @angular/core:standalone` (mode: convert-to-standalone)
   - Removes `standalone: false` from all components/directives/pipes, adds `imports` arrays
   - Updates NgModules to move declarations → imports

2. **Standalone Schematic Step 2: Remove unnecessary NgModules** — depends on step 1
   - `ng generate @angular/core:standalone` (mode: prune-ng-modules)
   - Deletes SharedModule, moves remaining module references
   - Manual cleanup of `TODO(standalone-migration)` comments

3. **Standalone Schematic Step 3: Standalone bootstrap** — depends on step 2
   - `ng generate @angular/core:standalone` (mode: standalone-bootstrap)
   - Converts `main.ts` to `bootstrapApplication`
   - Deletes AppModule, converts root providers to standalone APIs

4. **Inject Schematic** — depends on step 3
   - `ng generate @angular/core:inject`
   - Converts constructor injection to `inject()` calls throughout

5. **Signal Input Schematic** — depends on step 4
   - `ng generate @angular/core:signal-input-migration`
   - Converts `@Input()` to `input()` / `input.required()`

6. **Output Schematic** — depends on step 4
   - `ng generate @angular/core:output-migration`
   - Converts `@Output()` + `EventEmitter` to `output()`

7. **Signal Queries Schematic** — depends on step 4
   - `ng generate @angular/core:signal-queries-migration`
   - Converts `@ViewChild`/`@ViewChildren` to `viewChild()`/`viewChildren()`

8. **Manual: AuthInterceptor → Functional Interceptor** — depends on step 4
   - Rewrite `AuthInterceptor` class as `authInterceptorFn`
   - Update `provideHttpClient(withInterceptorsFromDi())` → `provideHttpClient(withInterceptors([authInterceptorFn]))`

9. **Manual: AppGuard → Functional Guard** — depends on step 4
   - Rewrite `AppGuard` class as `authGuard` function (`CanActivateFn`)
   - Update route configurations to use `canActivate: [authGuard]`

10. **Manual: BaseComponent Refactoring** — depends on steps 4–7
    - Replace `Injector` parameter with `inject()` calls
    - Replace dynamic `InjectionToken` / `createService()` with typed service injection
    - Convert `object`, `tableData`, `pageLength` to signals
    - Eliminate `any` types, add proper generics

11. **Manual: BaseService Refactoring** — depends on step 4
    - Replace `HttpClient` constructor injection with `inject(HttpClient)`
    - Type all method signatures with generics (eliminate `any`)
    - Type `HttpParams` operations properly
    - Type `getOptions()` return value

12. **Manual: Component Signal State Conversion** — depends on steps 5–7, 10
    - Convert local boolean/string/number properties to `signal()`
    - Convert derived values to `computed()`
    - Add `OnPush` change detection to all components
    - Verify `@if`/`@for` templates bind to signals correctly

13. **Zoneless with Fallback** — depends on steps 1–12
    - Add `provideExperimentalZoneless()` to bootstrap providers
    - Keep `zone.js` in polyfills temporarily
    - Test all interactive flows (modals, forms, navigation, HTTP)
    - Verify ng-zorro-antd components update correctly

14. **Full Zoneless + Bundle Optimization** — depends on step 13
    - Remove `zone.js` from polyfills and `package.json`
    - Remove `provideExperimentalZoneless()` if stable API is available
    - Reduce angular.json budgets from 5MB to appropriate target
    - Final lint cleanup — target zero errors and zero warnings
    - Remove dead services (UserService, CandidateService, VoterService, MessageService, ResumeVoting that exist but are unused/empty)

### Technical Dependencies

- **Angular CLI v21.2+** — must be installed and functional for schematic execution
- **Clean git branch** — schematics require a clean working directory
- **Build must pass** before each schematic run — schematics cannot analyze code that doesn't compile
- **ng-zorro-antd v21.2.2** — must support standalone imports (verified: it does)
- **TypeScript 5.9+** — required for Angular 21 decorator-less component support

## Monitoring and Observability

### Key Metrics to Track

| Metric | Tool | Frequency |
|--------|------|-----------|
| Lint error count | `ng lint 2>&1 \| grep -c "error "` | After every step |
| Lint warning count | `ng lint 2>&1 \| grep -c "warning "` | After every step |
| Build success | `ng build` exit code | After every step |
| Main bundle size | `ng build` output (Initial total) | After each phase |
| NgModules remaining | `find src -name "*.module.ts" \| wc -l` | After schematic steps |
| `any` type count | `grep -rn ": any" src/ \| wc -l` | After Phase 2 |
| Zone.js presence | Check `polyfills` in angular.json | Phase 3 |

## Technical Considerations

### Key Decisions

1. **Decision**: Simplified BaseComponent with `inject()` instead of elimination
   - **Rationale**: 13+ components depend on it; rewriting all would be disproportionate effort
   - **Trade-offs**: Some components inherit features they don't use; but the alternative (composition) requires rewriting every component

2. **Decision**: Single `BaseService<T>` refactored in place instead of splitting
   - **Rationale**: All method signatures are already structured; the issue is `any` types, not architectural scope
   - **Trade-offs**: The class remains large (~260 lines), but it's a coherent HTTP wrapper

3. **Decision**: Functional interceptor instead of class-based
   - **Rationale**: Angular 21 standard; eliminates `withInterceptorsFromDi()` dependency
   - **Trade-offs**: None significant for this use case

4. **Decision**: Functional guards instead of class-based
   - **Rationale**: Simpler, better tree-shaking, Angular 21 standard
   - **Trade-offs**: The current `CanDeactivate` logic is a no-op and should be removed

5. **Decision**: Zoneless with Zone.js fallback
   - **Rationale**: Zero test coverage makes immediate zoneless too risky
   - **Trade-offs**: Bundle temporarily includes Zone.js; must explicitly remove it later

6. **Decision**: Keep `@Inject(NZ_MODAL_DATA)` for modal data injection
   - **Rationale**: This is the official ng-zorro-antd pattern; converting to `input()` would require changing how modals are instantiated
   - **Trade-offs**: Mixes `@Inject` with signals, but this is standard Angular practice for token injection

### Known Risks

1. **BaseComponent `createService()` pattern** — The current code dynamically creates `BaseService<K>` instances with different endpoint paths using `InjectionToken` factories. The schematic will not handle this. **Mitigation**: Replace with `new BaseService<K>(http, path)` calls in the simplified base, or use a service factory pattern with named tokens.

2. **Zero test coverage** — No automated regression detection. **Mitigation**: Manual testing checklist after each phase; recommend adding smoke tests after Phase 1.

3. **ng-zorro-antd zoneless compatibility** — Some ng-zorro components (date picker, modal, dropdown) may not trigger change detection correctly without Zone.js. **Mitigation**: Zone.js fallback strategy (ADR-004); test each interactive component type systematically before removing Zone.js.

4. **Schematic output formatting** — Schematics may reformat code inconsistently. **Mitigation**: Run `ng lint --fix` after each schematic step; manual review of significant changes.

5. **Dead service files** — `UserService`, `CandidateService`, `VoterService`, `MessageService`, `ResumeVoting` in `src/services/` are empty/unused shell classes that duplicate names with the actual `BaseService`-based services. **Mitigation**: Delete these dead files during Phase 2 cleanup.

## Architecture Decision Records

- [ADR-001: Incremental Schematics-First Migration Strategy](adrs/adr-001.md) — Chose phased schematic execution with validation checkpoints over bottom-up manual migration or big-bang approach
- [ADR-002: Simplified BaseComponent with inject() and Generics](adrs/adr-002.md) — Keep a refactored BaseComponent with `inject()` instead of eliminating it or converting to a service
- [ADR-003: Functional HTTP Interceptor for Authentication](adrs/adr-003.md) — Convert AuthInterceptor class to functional `authInterceptorFn` registered via `withInterceptors()`
- [ADR-004: Zoneless with Zone.js Fallback Strategy](adrs/adr-004.md) — Adopt `provideExperimentalZoneless()` with Zone.js as fallback, remove Zone.js after validation
- [ADR-005: Functional Route Guards](adrs/adr-005.md) — Convert AppGuard class to functional `authGuard` using `CanActivateFn`
