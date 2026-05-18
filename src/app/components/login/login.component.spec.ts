import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { LoginComponent } from './login.component';
import { AuthService } from '../../../services/auth.service';
import { AuthResponse } from '../../../dto/auth-response';

describe('LoginComponent', () => {
    let fixture: ComponentFixture<LoginComponent>;
    let component: LoginComponent;
    let authService: jasmine.SpyObj<Pick<AuthService, 'login' | 'navigateByRole'>>;

    const authResponse: AuthResponse = {
        token: {
            access: 'access-token',
            refresh: 'refresh-token',
        },
    };

    beforeEach(async () => {
        authService = jasmine.createSpyObj<Pick<AuthService, 'login' | 'navigateByRole'>>(
            'AuthService',
            ['login', 'navigateByRole'],
        );

        await TestBed.configureTestingModule({
            imports: [LoginComponent],
            providers: [
                provideRouter([]),
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: {
                            queryParams: {},
                        },
                    },
                },
                { provide: AuthService, useValue: authService },
            ],
        })
            .overrideComponent(LoginComponent, {
                set: {
                    template: '',
                },
            })
            .compileComponents();

        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        spyOn(component, 'playSound');
    });

    it('delegates successful post-login routing to AuthService role routing', () => {
        authService.login.and.returnValue(of(authResponse));
        component.formGroup.patchValue({
            email: 'admin@example.com',
            password: 'secret',
        });

        component.login();

        expect(authService.login).toHaveBeenCalledWith('admin@example.com', 'secret');
        expect(authService.navigateByRole).toHaveBeenCalled();
        expect(component.playSound).toHaveBeenCalled();
    });

    it('keeps the user on the login form after failed authentication', () => {
        authService.login.and.returnValue(throwError(() => new Error('invalid credentials')));
        component.formGroup.patchValue({
            email: 'admin@example.com',
            password: 'bad-secret',
        });

        component.login();

        expect(component.message()).toBe('sign-in');
        expect(component.test()).toBeTrue();
        expect(authService.navigateByRole).not.toHaveBeenCalled();
    });
});
