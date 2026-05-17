# Task Memory: task_04.md

## Objective Snapshot
- Run Angular inject() migration schematic, convert constructor injection to inject() throughout.

## Important Decisions
- Used `NG_DEBUG=1` to ensure schematic actually executes
- The 2 remaining `prefer-inject` errors in BaseComponent are accepted — they'll be fully resolved in task_09 when BaseComponent is refactored
- `@Inject(NZ_MODAL_DATA)` was auto-converted to `inject(NZ_MODAL_DATA)` by the schematic — this is correct modern Angular pattern

## Learnings
- Inject schematic converted 74 prefer-inject errors down to 2 (only BaseComponent's manual Injector pattern remains)
- The schematic correctly handles modal components using NZ_MODAL_DATA token
- Components extending BaseComponent now use `inject(Injector)` at the constructor level instead of constructor parameter injection
- Lint reduced from 125 problems to 47 problems (2 errors + 45 warnings)

## Files / Surfaces
- 22 files updated by the inject schematic
- base.component.ts: unchanged by schematic (manual Injector pattern preserved)

## Status
- COMPLETED: 72 of 74 prefer-inject errors resolved, 2 remaining in BaseComponent (task_09 scope)
