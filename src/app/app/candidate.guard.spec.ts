import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';

import { candidateGuard } from './candidate.guard';
import { AuthService } from '../../services/auth.service';

type JwtRole = 'ELEITOR' | 'CANDIDATO' | null;

describe('candidateGuard', () => {
    let router: Router;
    let role: JwtRole;
    let authService: Pick<AuthService, 'isLoggedIn' | 'role'>;

    beforeEach(() => {
        role = null;
        authService = {
            isLoggedIn: jasmine.createSpy('isLoggedIn'),
            get role() {
                return role;
            },
        };

        TestBed.configureTestingModule({
            providers: [
                provideRouter([]),
                { provide: AuthService, useValue: authService },
            ],
        });

        router = TestBed.inject(Router);
    });

    function runGuard(): boolean | UrlTree {
        return TestBed.runInInjectionContext(
            () => candidateGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
        ) as boolean | UrlTree;
    }

    it('allows authenticated candidates', () => {
        role = 'CANDIDATO';
        (authService.isLoggedIn as jasmine.Spy).and.returnValue(true);

        expect(runGuard()).toBeTrue();
    });

    it('redirects electors to main', () => {
        role = 'ELEITOR';
        (authService.isLoggedIn as jasmine.Spy).and.returnValue(true);

        const result = runGuard();

        expect(result instanceof UrlTree).toBeTrue();
        expect(router.serializeUrl(result as UrlTree)).toBe('/main');
    });

    it('redirects unauthenticated users to main', () => {
        role = null;
        (authService.isLoggedIn as jasmine.Spy).and.returnValue(false);

        const result = runGuard();

        expect(result instanceof UrlTree).toBeTrue();
        expect(router.serializeUrl(result as UrlTree)).toBe('/main');
    });
});
