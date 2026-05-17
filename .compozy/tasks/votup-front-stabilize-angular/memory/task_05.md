# Task Memory: task_05.md

## Objective Snapshot
- Run signal-input, output, and signal-queries schematics.

## Important Decisions
- `@Input() voter: Voter` in VoterComponent kept as @Input() — it's reassigned via `this.voter = this.authService.user` which is incompatible with signal inputs (read-only). Will be addressed in task_09/10.
- `modalClosedEmitter: EventEmitter<void>` kept as EventEmitter — ng-zorro-antd's `nzAfterClose` property type is `EventEmitter<R>`, not compatible with Subject or output().
- `finishVote.emit()` changed to `finishVote.emit(undefined)` because `output<void>().emit()` requires an argument.

## Learnings
- Signal-input schematic skips inputs that are reassigned programmatically (1/6 couldn't migrate)
- output() migration removes EventEmitter from @angular/core imports — must re-add if EventEmitter is still used elsewhere (modalClosedEmitter)
- viewChild() migration correctly updates templates that reference the old property (e.g., `paginator.nzPageIndex` → `paginator().nzPageIndex`)
- ng-zorro-antd nzAfterClose strictly requires EventEmitter<R> type

## Files / Surfaces
- 5 components: signal inputs converted (users, candidate, voting, lowercase, uppercase directives)
- 2 components: output() converted (users valueEmitter, voting finishVote)
- BaseComponent: @ViewChild → viewChild() for paginator
- 6 HTML templates: updated for viewChild signal syntax

## Status
- COMPLETED
