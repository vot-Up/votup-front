# PRD: VotUp Front — Angular 21 Stabilization & Modernization

## Overview
The votup-front application runs Angular 21.2 but retains the legacy NgModule-based architecture, constructor injection, and RxJS-heavy patterns from earlier Angular versions. This creates 97 lint errors, 51 warnings, and a codebase that is difficult for developers to read, navigate, and evolve. This initiative migrates the entire frontend to Angular 21's modern architecture — standalone components, signals-first reactivity, `inject()` dependency injection, and zoneless change detection — to deliver a codebase that is readable, maintainable, and aligned with the framework's long-term direction.

**Problem**: Developers struggle to understand and navigate the codebase due to architectural indirections (BaseComponent with dynamic InjectionTokens, BaseService with pervasive `any`), module coupling, and patterns that Angular 21 considers legacy.

**Who it is for**: The internal development team working on the VotUp voting platform.

**Why it is valuable**: A modern Angular codebase reduces cognitive load, eliminates lint noise, enables faster feature development, and ensures compatibility with future Angular releases.

## Goals
- Eliminate all 97 lint errors and reduce warnings to near-zero
- Fully migrate to standalone components, directives, and pipes — remove all NgModules
- Adopt `inject()` throughout, replacing all constructor-based injection
- Adopt signals-first reactivity: `input()`, `output()`, `signal()`, `computed()`, signal queries
- Adopt modern control flow syntax (`@if`, `@for`, `@switch`) replacing `*ngIf`, `*ngFor`, `*ngSwitch`
- Refactor BaseComponent and BaseService for strong typing, eliminating `any` usage
- Enable zoneless change detection, removing Zone.js dependency
- Maintain a passing build at every phase — no regressions in application functionality

## User Stories

### As a developer on the VotUp team:
- I want all components, directives, and pipes to be standalone so that I can understand their dependencies directly from their `imports` array without tracing through NgModules
- I want dependency injection via `inject()` so that I can quickly identify what a class depends on without parsing constructor parameters
- I want component inputs and outputs to use `input()` and `output()` so that I can compose them with `computed()` and `effect()` in a signals-based reactive flow
- I want local component state to use `signal()` and `computed()` so that change detection is predictable and fine-grained
- I want BaseComponent and BaseService to be strongly typed so that I can navigate the codebase without encountering opaque `any` types
- I want modern control flow (`@if`, `@for`) in templates so that the template syntax is consistent with JavaScript and properly type-checked
- I want zoneless change detection so that the application runs faster with smaller bundle size and no Zone.js overhead
- I want a passing lint suite so that lint output is meaningful and not a wall of ignored noise

## Core Features

### F1: Standalone Architecture
All components, directives, and pipes operate as standalone entities specifying their own imports. NgModules are eliminated. The application bootstraps via `bootstrapApplication()` with standalone APIs (`provideRouter`, `provideHttpClient`, `provideAnimations`, etc.).

### F2: inject() Dependency Injection
All services, guards, interceptors, and components use Angular's `inject()` function for dependency injection instead of constructor parameter injection. This provides better type inference and aligns with Angular 21 standards.

### F3: Signals-First Reactivity
Component inputs use `input()` and `input.required()`. Outputs use `output()`. Local state uses `signal()`. Derived state uses `computed()`. DOM queries use `viewChild()` and `viewChildren()`. RxJS remains for HTTP calls and async operations where signals are not appropriate.

### F4: Modern Control Flow
Templates use `@if`/`@else`, `@for`/`@empty`, and `@switch`/`@case`/`@default` instead of `*ngIf`, `*ngFor`, `*ngSwitch`. The `CommonModule` is no longer imported — individual standalone directives replace it where needed.

### F5: Strongly-Typed Base Layer
BaseComponent is refactored to remove the dynamic InjectionToken pattern and manual `Injector.get()` calls. BaseService is refactored to eliminate `any` types with proper generics. Both leverage `inject()` and signals natively.

### F6: Zoneless Change Detection
Zone.js is removed from the application. Change detection relies entirely on Angular's signals-based reactive model. The `polyfills` configuration drops `zone.js`. Components use `OnPush` change detection strategy where beneficial.

## User Experience

### Key Persona: VotUp Frontend Developer
**Goal**: Read, modify, and extend the VotUp frontend with confidence and speed.

**Primary Flow — Adding a New Feature**:
1. Developer creates a new standalone component — dependencies are explicit in the `imports` array
2. Uses `inject()` to obtain services — no constructor boilerplate
3. Defines inputs with `input()` and outputs with `output()` — immediately usable in `computed()` chains
4. Manages local state with `signal()` — change detection is automatic and fine-grained
5. Writes template with `@if`/`@for` — type-safe and consistent with TypeScript
6. Lint passes cleanly — no ignored noise, meaningful feedback only

**Primary Flow — Reading Existing Code**:
1. Opens a component file — sees all dependencies in `imports` array and `inject()` calls at the top
2. Sees signal-based state and computed values — reactive flow is explicit and traceable
3. No need to cross-reference NgModules or trace constructor parameters
4. Types are explicit — no `any` obscuring the data flow

### Onboarding and Discoverability
- New team members can understand any component by reading one file — no module indirection
- Angular 21 documentation and community resources directly apply — no legacy pattern mismatches
- Lint rules enforce modern patterns automatically, preventing backsliding

## High-Level Technical Constraints
- The application communicates with a Django REST Framework backend via the URL patterns defined in `app.urls.ts` — API contracts must remain unchanged
- ng-zorro-antd (v21.2.2) is the UI component library — must remain compatible throughout migration
- ngx-mask (v21.0.1) is used for input masking — must remain compatible
- The application must continue to build with `ng build` and serve with `ng serve` at every phase
- No external API changes — the backend integration layer remains functionally identical

## Non-Goals (Out of Scope)
- Adding unit or integration tests (separate initiative)
- Changing the UI/UX design or visual behavior
- Migrating to a different UI library (e.g., replacing ng-zorro-antd)
- Adding new user-facing features
- Server-side rendering (SSR) or progressive web app (PWA) setup
- Changing the backend API or data models
- Migrating to a different state management library (e.g., NgRx) — signals cover local state

## Phased Rollout Plan

### MVP (Phase 1): Schematics Automation — Clean Build & Reduced Lint
**Scope**:
- Run standalone migration schematic (3 sub-steps: convert declarations → prune NgModules → standalone bootstrap)
- Run inject migration schematic
- Run control-flow migration schematic
- Run signal-input migration schematic
- Run output migration schematic
- Run signal-queries migration schematic
- Manual cleanup: remove remaining NgModule references, fix schematic edge cases, format code

**Success criteria**:
- `ng build` passes with zero errors
- Lint errors reduced from 97 to 0 (standalone and inject errors eliminated)
- All components, directives, and pipes are standalone
- Application bootstraps via `bootstrapApplication()`
- No NgModules remain in the codebase

### Phase 2: Signals-Deep Adoption & Structural Refactoring
**Scope**:
- Refactor BaseComponent: replace dynamic InjectionToken pattern with `inject()`, add proper generics, eliminate `any`
- Refactor BaseService: add proper generic types, eliminate `any`, use `inject()` for HttpClient
- Convert component local state from plain properties to `signal()` and `computed()`
- Replace `EventEmitter` with `output()` where not already converted
- Apply `OnPush` change detection strategy to components

**Success criteria**:
- Lint warnings reduced from 51 to fewer than 10
- `any` usage eliminated in service and base layers
- BaseComponent no longer uses manual `Injector.get()` or dynamic `InjectionToken`
- Component state is signals-based where appropriate

### Phase 3: Zoneless & Full Modernization
**Scope**:
- Remove Zone.js from polyfills and dependencies
- Enable zoneless change detection
- Verify all async operations work correctly without Zone.js (HTTP calls, router navigation, timers)
- Optimize bundle size — reduce budget from 5MB to appropriate Angular 21 target
- Final lint cleanup to zero errors and zero warnings
- Remove any remaining legacy patterns

**Success criteria**:
- Zone.js is not in the production bundle
- Application functions correctly with zoneless change detection
- Lint passes with zero errors and zero warnings
- Bundle size reduced significantly from current 1.64 MB main chunk
- Codebase fully reflects Angular 21 best practices

## Success Metrics
| Metric | Current | Target |
|--------|---------|--------|
| Lint errors | 97 | 0 |
| Lint warnings | 51 | 0 |
| NgModules count | 5 | 0 |
| Components with `standalone: false` | ~20 | 0 |
| Constructor injection sites | ~74 | 0 |
| `any` type usages | ~30+ | < 5 |
| Main bundle size | 1.64 MB | < 1.2 MB |
| Zone.js in bundle | Yes | No |
| Build passes | Yes | Yes |

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Schematics may not handle BaseComponent's dynamic InjectionToken pattern | Manual fixes required after schematic runs | Validate build after each schematic step; document edge cases for manual cleanup |
| Zero test coverage means regressions are only caught by build verification and manual testing | Functional regressions may go undetected | Test each phase manually in the browser; add critical-path smoke tests early if feasible |
| ng-zorro-antd compatibility with zoneless mode | UI components may not update correctly without Zone.js | Verify ng-zorro-antd v21.2.2 zoneless support; test all interactive components thoroughly |
| Team may stop after Phase 1 (schematics) without completing structural refactoring | Codebase is partially modernized with mixed patterns | Phase plan makes each phase independently valuable; document the cost of stopping early |
| Signal migration may over-transform RxJS patterns that are better left as observables | HTTP and async operations unnecessarily converted to signals | Keep RxJS for HTTP/async; only convert local synchronous state to signals |

## Architecture Decision Records
- [ADR-001: Incremental Schematics-First Migration Strategy](adrs/adr-001.md) — Chose phased schematic execution with validation checkpoints over bottom-up manual migration or big-bang approach

## Open Questions
- Should minimal smoke tests (e.g., component rendering checks) be added as part of Phase 1 to provide a safety net for subsequent phases, or is that a separate initiative?
- Is there a preferred bundle size budget target for Angular 21 applications with ng-zorro-antd, or should the team establish one empirically during Phase 3?
- Are there any backend API changes planned that should be coordinated with this frontend modernization effort?
