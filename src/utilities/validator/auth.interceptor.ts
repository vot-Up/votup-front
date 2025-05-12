import {Injectable} from "@angular/core";
import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
    HttpResponse
} from "@angular/common/http";
import {Observable} from "rxjs";


import {tap} from "rxjs/operators";
import {NzMessageService} from "ng-zorro-antd/message";
import {AuthService} from "../../services/auth.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(public toast: NzMessageService,
                public authService: AuthService) {
    }

    public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        req = this._addHeader(req);
        return next.handle(req).pipe(tap((event: HttpEvent<any>) => {
            if (event instanceof HttpResponse) {
            }
        }, (errorResponse: HttpErrorResponse) => {
            this.handleError(errorResponse);
        }));
    }

    private handleError(err: HttpErrorResponse): void {
        if (err.status === 0) {
            this.toast.create("error", "Error desconhecido!");
            return;
        } else if (err.status === 401) {
            this.authService.logout(false, true);
            return;
        }

        const errors = AuthInterceptor.captureError(err.error);
        errors.forEach(t => {
            if (t instanceof Blob) {
                const reader = new FileReader();
                reader.addEventListener("loadend", () => {
                    this.showErrors(JSON.parse(reader.result.toString()));
                });
                reader.readAsText(t);
            } else {
                this.showErrors(t);
            }
        });
    }

    _addHeader(req: HttpRequest<any>) {
        return req.clone({
            setHeaders: {
                "Accept-Language": `pt-BR`
            }
        });
    }

    private showErrors(value: any): void {
        Object.keys(value).forEach((key: any) => {
            this.toast.create("error", value[key]);
        });
    }

    // Function to capture errors
    private static captureError(value: any): any[] {
        if (value instanceof Array) {
            return value;
        } else if (AuthInterceptor.isJson(value)) {
            return [value];
        }
        return [{detail: value}];
    }

    private static isJson(item) {
        item = typeof item !== "string" ? JSON.stringify(item) : item;
        try {
            item = JSON.parse(item);
        } catch (e) {
            return false;
        }
        return typeof item === "object" && item !== null;
    }
}
