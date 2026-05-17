import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import {Observable} from "rxjs";
import {tap} from "rxjs/operators";
import {inject} from "@angular/core";
import {NzMessageService} from "ng-zorro-antd/message";
import {AuthService} from "../../services/auth.service";

export const authInterceptorFn: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const toast = inject(NzMessageService);
  const authService = inject(AuthService);

  req = addHeader(req);
  return next(req).pipe(
    tap({
      error: (err: HttpErrorResponse) => handleError(err, toast, authService)
    })
  );
};

function addHeader(req: HttpRequest<unknown>): HttpRequest<unknown> {
  return req.clone({
    setHeaders: {
      "Accept-Language": "pt-BR"
    }
  });
}

function handleError(err: HttpErrorResponse, toast: NzMessageService, authService: AuthService): void {
  if (err.status === 0) {
    toast.create("error", "Error desconhecido!");
    return;
  } else if (err.status === 401) {
    authService.logout(false, true);
    return;
  }

  const errors = captureError(err.error);
  errors.forEach(t => {
    if (t instanceof Blob) {
      const reader = new FileReader();
      reader.addEventListener("loadend", () => {
        showErrors(JSON.parse(reader.result.toString()), toast);
      });
      reader.readAsText(t);
    } else {
      showErrors(t, toast);
    }
  });
}

function showErrors(value: Record<string, unknown>, toast: NzMessageService): void {
  Object.keys(value).forEach((key: string) => {
    const error = value[key];
    if (Array.isArray(error)) {
      error.forEach((message) => toast.create("error", String(message)));
      return;
    }
    toast.create("error", String(error));
  });
}

function captureError(value: unknown): Array<Record<string, unknown>> {
  if (Array.isArray(value)) {
    return value as Array<Record<string, unknown>>;
  } else if (isJson(value)) {
    return [value as Record<string, unknown>];
  }
  return [{ detail: value }];
}

function isJson(item: unknown): item is Record<string, unknown> {
  const value = typeof item !== "string" ? JSON.stringify(item) : item;
  try {
    JSON.parse(value);
  } catch {
    return false;
  }
  return true;
}
