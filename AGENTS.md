# Repository Guidelines

## Project Structure & Module Organization

This is an Angular application named `votup`. Application code lives under `src/`.
Key entry points are `src/main.ts`, `src/index.html`, and `src/app/app.routes.ts`.
Feature screens are grouped in `src/app/components/` and `src/app/core/components/`.
Shared UI and pipes live in `src/app/shared/`; guards, base components, and routes live in `src/app/core/` and `src/app/app/`.
Reusable services, DTOs, models, utilities, and validators are kept in `src/services/`, `src/dto/`, `src/models/`, and `src/utilities/`.
Static files are in `src/assets/`, with global LESS theme configuration in `src/theme.less`.

## Build, Test, and Development Commands

- `npm install`: install dependencies. The README recommends Node `v22.13.0` via `nvm`.
- `npm start`: run `ng serve` for local development.
- `npm run build`: create a production build in `dist/votup`.
- `npm run watch`: build continuously with the Angular development configuration.
- `npm test`: run Karma/Jasmine unit tests.
- `npm run lint`: run Angular ESLint on `src/**/*.ts` and `src/**/*.html`.

## Coding Style & Naming Conventions

Follow `.editorconfig`: UTF-8, spaces, 4-space indentation, final newline, and trimmed trailing whitespace. TypeScript uses single quotes.
Angular component selectors use the `app-` prefix in kebab case, and directive selectors use the `app` prefix in camel case.
Keep Angular files in the standard naming pattern: `feature.component.ts`, `feature.component.html`, `feature.component.less`, and `feature.component.spec.ts`.
Prefer typed models from `src/models/` and DTOs from `src/dto/` instead of passing unstructured objects. Avoid `any` unless the API boundary requires it; ESLint warns on explicit `any`.

## Testing Guidelines

Unit tests use Jasmine and Karma through Angular CLI. Place specs next to the code they cover using `*.spec.ts`, as in `src/services/base.service.spec.ts`.
Add or update tests when changing services, guards, routing logic, pipes, validators, or component behavior. Run `npm test` before submitting behavioral changes, and run `npm run lint` when touching TypeScript or templates.

## Commit & Pull Request Guidelines

Recent history is informal, with short messages such as `feat eae`, `commit`, and merge commits from feature branches. Use clearer messages going forward, for example `feat: add voter ranking view` or `fix: handle expired auth token`.
Pull requests should include a short description, testing performed, linked issue when available, and screenshots or recordings for visible UI changes. Call out environment or API configuration changes explicitly.

## Security & Configuration Tips

Do not commit real secrets or production credentials. Keep environment-specific values in `src/environments/environment.ts` and `src/environments/environment.prod.ts`, and verify API URLs before building production Docker images.
