# Task Memory: task_03.md

## Objective Snapshot
- Convert from root NgModule bootstrap to standalone `bootstrapApplication`, remove all remaining NgModules, convert lazy routes to direct route imports.

## Important Decisions
- Used `NG_DEBUG=1` env var to force schematic execution — without it, the schematic returned "Nothing to be done"
- Kept `withInterceptorsFromDi()` for class-based AuthInterceptor (task_06 converts to functional)
- Kept `importProvidersFrom()` for ng-zorro-antd NgModules that don't yet have standalone provider APIs
- Renamed `app-routing.module.ts` → `app.routes.ts` and `core-routing.module.ts` → `core.routes.ts` for clarity
- Added `withComponentInputBinding()` to `provideRouter` per techspec data flow design

## Learnings
- The standalone-bootstrap schematic requires `NG_DEBUG=1` to actually execute (otherwise silently reports "Nothing to be done")
- ng-zorro-antd modules (NzLayoutModule, NzFormModule, etc.) are still NgModule-based and must remain as `importProvidersFrom()` until they provide standalone APIs
- Lazy loading core routes via `loadChildren: () => import("./core/core.routes").then(m => m.ROUTES)` works correctly and creates a separate lazy chunk
- Bundle improved: main chunk 1.64MB → 1.54MB, total 2.32MB → 2.22MB (core routes now lazy-loaded)

## Files / Surfaces
- `src/main.ts` — rewritten with bootstrapApplication
- `src/app/app.module.ts` — DELETED
- `src/app/app-routing.module.ts` → `src/app/app.routes.ts` — renamed, lazy route converted
- `src/app/core/core.module.ts` — DELETED
- `src/app/core/core-routing.module.ts` → `src/app/core/core.routes.ts` — renamed

## Status
- COMPLETED: All NgModules removed, bootstrapApplication active, build passes, lazy routes work
