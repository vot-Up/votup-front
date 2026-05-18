import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { URLS } from '../app/app/app.urls';
import { AuthResponse } from '../dto/auth-response';
import { environment } from '../environments/environment';

export type RegistrationRole = 'ELEITOR' | 'CANDIDATO';

export interface RegisterPayload {
    name: string;
    email: string;
    cellphone: string;
    password: string;
    confirm_password: string;
    role: RegistrationRole;
}

@Injectable({ providedIn: 'root' })
export class RegisterService {
    private http = inject(HttpClient);
    private readonly url = `${environment.urlBase}${URLS.REGISTER}`;

    public register(payload: RegisterPayload): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(this.url, payload);
    }
}
