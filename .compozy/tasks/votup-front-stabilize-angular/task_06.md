---
status: pending
title: Rewrite AuthInterceptor as functional interceptor
type: refactor
complexity: medium
dependencies:
- task_04
---

# Task 06: Rewrite AuthInterceptor as functional interceptor

## Overview
Convert the class-based `AuthInterceptor` (implements `HttpInterceptor`) to a functional interceptor (`HttpInterceptorFn`) using `inject()` internally. This eliminates the deprecated interceptor pattern and removes the need for `withInterceptorsFromDi()` in the HTTP client configuration.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST rewrite `AuthInterceptor` class as a functional `HttpInterceptorFn` named `authInterceptorFn`
- MUST use `inject()` inside the function to obtain `AuthService` and `NzMessageService`
- MUST preserve all existing behavior: add `Accept-Language: pt-BR` header, add `Authorization: Bearer <token>` header, handle 401 with logout/redirect, display error messages via toast
- MUST update `provideHttpClient(withInterceptorsFromDi())` to `provideHttpClient(withInterceptors([authInterceptorFn]))`
- MUST remove the `HTTP_INTERCEPTORS` provider from bootstrap configuration
- MUST delete the old `AuthInterceptor` class file or convert it entirely
- MUST verify `ng build` passes with zero errors
- MUST verify HTTP requests still include auth headers and error handling works
</requirements>

## Subtasks
- [ ] 6.1 Ensure task_04 is complete (inject() available)
- [ ] 6.2 Create `authInterceptorFn` as `HttpInterceptorFn` in `src/utilities/validator/auth.interceptor.ts`
- [ ] 6.3 Implement token retrieval from localStorage inside the function
- [ ] 6.4 Implement `Accept-Language: pt-BR` header injection via `req.clone()`
- [ ] 6.5 Implement `Authorization: Bearer <token>` header injection
- [ ] 6.6 Implement 401 error handling with `inject(AuthService).logout(false, true)`
- [ ] 6.7 Implement error display via `inject(NzMessageService).create('error', ...)`
- [ ] 6.8 Handle Blob error responses (FileReader pattern) as in original code
- [ ] 6.9 Update bootstrap providers: `withInterceptors([authInterceptorFn])` replacing `withInterceptorsFromDi()`
- [ ] 6.10 Remove `HTTP_INTERCEPTORS` provider from bootstrap
- [ ] 6.11 Delete or replace the old class-based interceptor code
- [ ] 6.12 Verify `ng build` passes; manually test login flow and API error handling
- [ ] 6.13 Commit changes

## Implementation Details

The current `AuthInterceptor` does three things:
1. Adds `Accept-Language: pt-BR` header to all requests via `_addHeader()`
2. On response error: handles 401 by logging out, handles other errors by displaying toast messages
3. Handles Blob error responses by reading them with FileReader

The functional interceptor preserves this exact logic but uses `inject()` instead of constructor injection. See TechSpec "Core Interfaces" section for the `authInterceptorFn` pattern.

The key bootstrap change is in `main.ts` (or the bootstrap configuration file):
- Remove: `{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }`
- Change: `provideHttpClient(withInterceptorsFromDi())` → `provideHttpClient(withInterceptors([authInterceptorFn]))`

### Relevant Files
- `src/utilities/validator/auth.interceptor.ts` — rewrite from class to function
- `src/main.ts` (or bootstrap config) — update `provideHttpClient` call, remove `HTTP_INTERCEPTORS` provider

### Dependent Files
- `src/services/auth.service.ts` — injected by the functional interceptor
- All HTTP requests in the application — auth headers and error handling behavior must be preserved

### Related ADRs
- [ADR-003: Functional HTTP Interceptor for Authentication](../adrs/adr-003.md) — Decision to use functional interceptor over class-based

## Deliverables
- `authInterceptorFn` function implementing `HttpInterceptorFn`
- Old `AuthInterceptor` class removed
- `provideHttpClient(withInterceptors([authInterceptorFn]))` in bootstrap
- `HTTP_INTERCEPTORS` provider removed from bootstrap
- `ng build` passes with zero errors
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for HTTP behavior **(REQUIRED)**

## Tests
- Unit tests:
  - [ ] `authInterceptorFn` adds `Accept-Language: pt-BR` header to outgoing requests
  - [ ] `authInterceptorFn` adds `Authorization: Bearer <token>` when token exists in localStorage
  - [ ] `authInterceptorFn` does not add Authorization header when no token in localStorage
  - [ ] 401 response triggers `authService.logout(false, true)`
  - [ ] Non-401 error response displays error message via NzMessageService
  - [ ] Blob error responses are read via FileReader and parsed as JSON
- Integration tests:
  - [ ] Login flow: POST to `/api/account/token/` includes `Accept-Language` header
  - [ ] Authenticated requests include `Authorization: Bearer` header
  - [ ] 401 response redirects to login page
  - [ ] Application loads without console errors after interceptor migration
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- `withInterceptorsFromDi()` no longer appears in the codebase
- `HTTP_INTERCEPTORS` token no longer referenced in providers
- HTTP auth headers and error handling work identically to the class-based interceptor
- `ng build` passes with zero errors
