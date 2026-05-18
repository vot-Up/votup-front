import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { environment } from '../environments/environment';
import { URLS } from '../app/app/app.urls';
import { AuthResponse } from '../dto/auth-response';
import { RegisterPayload, RegisterService } from './register.service';

describe('RegisterService', () => {
    let service: RegisterService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                RegisterService,
                provideHttpClient(),
                provideHttpClientTesting(),
            ],
        });

        service = TestBed.inject(RegisterService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('posts registration payload to the account register endpoint', () => {
        const payload: RegisterPayload = {
            name: 'Maria Silva',
            email: 'maria@example.com',
            cellphone: '(92) 99999-9999',
            password: 'secret123',
            confirm_password: 'secret123',
            role: 'CANDIDATO',
        };
        const response: AuthResponse = {
            token: {
                access: 'access-token',
                refresh: 'refresh-token',
            },
        };

        service.register(payload).subscribe(result => {
            expect(result).toEqual(response);
        });

        const request = httpMock.expectOne(`${environment.urlBase}${URLS.REGISTER}`);
        expect(request.request.method).toBe('POST');
        expect(request.request.body).toEqual(payload);
        request.flush(response);
    });
});
