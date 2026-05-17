import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest, HttpResponse } from "@angular/common/http";
import {Observable} from "rxjs";
import {tap} from "rxjs/operators";
import {inject} from "@angular/core";
import {NzMessageService} from "ng-zorro-antd/message";
import {AuthService} from "../../services/auth.service";

export const authInterceptorFn: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const toast = inject(NzMessageService);
  const authService = inject(AuthService);

  req = addHeader(req);
  return next(req).pipe(
    tap({
      error: (err: HttpErrorResponse) => handleError(err, toast, authService)
    })
  );
};

function addHeader(req: HttpRequest<any>): HttpRequest<any> {
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

function showErrors(value: any, toast: NzMessageService): void {
  Object.keys(value).forEach((key: any) => {
    toast.create("error", value[key]);
  });
}

function captureError(value: any): any[] {
  if (value instanceof Array) {
    return value;
  } else if (isJson(value)) {
    return [value];
  }
  return [{detail: value}];
}

function isJson(item: any): boolean {
  item = typeof item !== "string" ? JSON.stringify(item) : item;
  try {
    item = JSON.parse(item);
  } catch (e) {
    return false;
  }
  return typeof item === "object" && item !== null;
}
