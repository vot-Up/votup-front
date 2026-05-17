# VotUp Front — Angular 21 Stabilization & Modernization — Task List

## Tasks

| # | Title | Status | Complexity | Dependencies |
|---|-------|--------|------------|--------------|
| 01 | Run standalone schematic: convert declarations to standalone | completed | medium | — |
| 02 | Run standalone schematic: prune NgModules | completed | medium | task_01 |
| 03 | Run standalone schematic: standalone bootstrap | completed | high | task_02 |
| 04 | Run inject migration schematic | completed | medium | task_03 |
| 05 | Run signal-input, output, and signal-queries schematics | completed | medium | task_04 |
| 06 | Rewrite AuthInterceptor as functional interceptor | completed | medium | task_04 |
| 07 | Rewrite AppGuard as functional guard | pending | low | task_04 |
| 08 | Refactor BaseService: eliminate `any`, add typed generics, use `inject()` | pending | high | task_04 |
| 09 | Refactor BaseComponent: replace Injector pattern with `inject()`, add signal state | pending | critical | task_05, task_08 |
| 10 | Convert component local state to signals and apply OnPush | pending | high | task_09 |
| 11 | Clean up dead service files and model `any` types | pending | low | task_04 |
| 12 | Enable zoneless with Zone.js fallback | pending | high | task_10 |
| 13 | Full zoneless: remove Zone.js, optimize bundle, final lint cleanup | pending | high | task_12 |
