# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # install dependencies (Node v22.13.0 via nvm)
npm start            # ng serve — local dev server
npm run build        # production build → dist/votup
npm run watch        # continuous dev build
npm test             # Karma/Jasmine unit tests
npm run lint         # Angular ESLint on *.ts and *.html
```

Single test file: Karma has no built-in filter, but you can focus tests in the spec file with `fdescribe`/`fit` temporarily.

## Architecture

**Angular 21** app with **ng-zorro-antd** (Ant Design) as the component library, **Less** for styles, and a **Django REST Framework** backend.

### Route Layout

- Public: `/login`, `/main`, `/login-elector`, `/reset-password`
- Protected (via `authGuard`): `/core/**` — lazy-loaded from `src/app/core/core.routes.ts`
  - Core screens: `vote`, `users`, `voters`, `candidates`, `candidate_group` (plates)

### Service Layer — `BaseService<T>`

`src/services/base.service.ts` is the foundation for all API calls. Every feature service extends it with a path (e.g. `new BaseService('/voters/')`). It handles:
- Auth token injection from `localStorage` or a per-call override via `changeToken()`
- Query params via `addParameter()` / `clearParameter()` — must call `clearParameter()` before each request if reusing the service instance
- Paginated DRF responses via `getPaginated*()` methods
- DRF `OPTIONS` / choices via `options()` and `getChoices()`

### Responsive Modal

`src/services/responsive-modal.service.ts` wraps `NzModalService` to produce full-screen sheets on mobile (<768 px) and centered modals on desktop. Use `ResponsiveModalService.create()` instead of `NzModalService.create()` directly for any modal that needs mobile-first behavior. Use `createConfirm()` for destructive confirmations.

### Design System

Design tokens are defined in `src/styles/design-tokens.less` and imported by `src/theme.less` and component Less files. The design language (`DESIGN.md`) is based on Wise branding:
- Primary accent: `@colors-primary` (`#9fe870`) — used only for CTA, never as success/status indicator
- Canonical radius: `@rounded-xl` (24 px) for buttons and cards
- Breakpoints: mobile `<768px`, tablet `768–1023px`, desktop `≥1024px`

### Expandable List Pattern

All admin list screens (Voter, Candidate, Users, Plate, Vote) share the mixin-based pattern from `src/styles/expandable-list.less`. Import both `design-tokens` and `expandable-list` in the component Less file, then call the three mixins (`.expandable-list-container()`, `.expandable-list-item()`, `.expandable-list-expanded()`). HTML uses the CSS class names produced by those mixins.

### Coding Conventions

- Component selectors: `app-` prefix, kebab-case. Directive selectors: `app` prefix, camelCase.
- Use typed models from `src/models/` and DTOs from `src/dto/` — avoid `any`.
- Single quotes in TypeScript; 4-space indentation; final newline (enforced by `.editorconfig`).
- API base URL is in `src/environments/environment.ts` (`environment.urlBase`).

### Key Dependencies

| Package | Purpose |
|---|---|
| `ng-zorro-antd` | Ant Design component library (modals, tables, icons, forms) |
| `@angular/cdk` | `BreakpointObserver` for responsive detection |
| `ngx-mask` | Input masking |
| `jwt-decode` | Token parsing |
| `swiper` | Swipe/carousel UI |
| `howler` | Audio playback |
