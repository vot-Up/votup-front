import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { authGuard } from './auth.guard';
import { AuthService } from '../../services/auth.service';

describe('authGuard', () => {
    let isAdmin: boolean;
    let authService: Pick<AuthService, 'isLoggedIn' | 'isAdmin' | 'logout'>;

    beforeEach(() => {
        isAdmin = false;
        authService = {
            isLoggedIn: jasmine.createSpy('isLoggedIn'),
            logout: jasmine.createSpy('logout'),
            get isAdmin() {
                return isAdmin;
            },
        };

        TestBed.configureTestingModule({
            providers: [
                { provide: AuthService, useValue: authService },
            ],
        });
    });

    function runGuard(): boolean {
        return TestBed.runInInjectionContext(() => authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)) as boolean;
    }

    it('allows logged-in staff users', () => {
        isAdmin = true;
        (authService.isLoggedIn as jasmine.Spy).and.returnValue(true);

        expect(runGuard()).toBeTrue();
        expect(authService.logout).not.toHaveBeenCalled();
    });

    it('blocks logged-in non-staff users and logs them out', () => {
        isAdmin = false;
        (authService.isLoggedIn as jasmine.Spy).and.returnValue(true);

        expect(runGuard()).toBeFalse();
        expect(authService.logout).toHaveBeenCalledWith(false, true);
    });
});
