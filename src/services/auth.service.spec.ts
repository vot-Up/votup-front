import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { AuthService } from './auth.service';
import { AppVariables } from '../app/app/app.variables';

type JwtRole = 'ELEITOR' | 'CANDIDATO' | null;

function encodeJwtSegment(value: object): string {
    return btoa(JSON.stringify(value))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '');
}

function buildToken(role: JwtRole, isStaff: boolean): string {
    const now = Math.floor(Date.now() / 1000);
    const payload = {
        user_id: 1,
        username: 'auth-user',
        email: 'auth-user@example.com',
        role,
        user: {
            id: 1,
            url: '/account/user/1/',
            is_staff: isStaff,
        },
        exp: now + 3600,
        orig_iat: now,
    };

    return [
        encodeJwtSegment({ alg: 'none', typ: 'JWT' }),
        encodeJwtSegment(payload),
        '',
    ].join('.');
}

describe('AuthService role routing', () => {
    let service: AuthService;
    let router: jasmine.SpyObj<Router>;

    beforeEach(() => {
        router = jasmine.createSpyObj<Router>('Router', ['navigate']);
        router.navigate.and.returnValue(Promise.resolve(true));

        TestBed.configureTestingModule({
            providers: [
                AuthService,
                AppVariables,
                provideHttpClient(),
                { provide: Router, useValue: router },
            ],
        });

        service = TestBed.inject(AuthService);
    });

    afterEach(() => {
        localStorage.removeItem('token');
    });

    it('returns ELEITOR from an elector JWT', () => {
        localStorage.setItem('token', buildToken('ELEITOR', false));

        expect(service.role).toBe('ELEITOR');
    });

    it('returns CANDIDATO from a candidate JWT', () => {
        localStorage.setItem('token', buildToken('CANDIDATO', false));

        expect(service.role).toBe('CANDIDATO');
    });

    it('returns null from an admin JWT', () => {
        localStorage.setItem('token', buildToken(null, true));

        expect(service.role).toBeNull();
    });

    it('navigates admins to the admin voting screen', () => {
        localStorage.setItem('token', buildToken(null, true));

        service.navigateByRole();

        expect(router.navigate).toHaveBeenCalledWith(['/core/vote']);
    });

    it('navigates candidates to the candidate plates portal', () => {
        localStorage.setItem('token', buildToken('CANDIDATO', false));

        service.navigateByRole();

        expect(router.navigate).toHaveBeenCalledWith(['/candidate/plates']);
    });

    it('navigates electors to the voting flow', () => {
        localStorage.setItem('token', buildToken('ELEITOR', false));

        service.navigateByRole();

        expect(router.navigate).toHaveBeenCalledWith(['/login-elector']);
    });
});
