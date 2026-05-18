import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AuthResponse } from '../../../dto/auth-response';
import { AuthService } from '../../../services/auth.service';
import { RegisterPayload, RegisterService } from '../../../services/register.service';
import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
    let fixture: ComponentFixture<RegisterComponent>;
    let component: RegisterComponent;
    let registerService: jasmine.SpyObj<RegisterService>;
    let authService: jasmine.SpyObj<Pick<AuthService, 'setToken' | 'navigateByRole'>>;
    let router: Router;

    const authResponse: AuthResponse = {
        token: {
            access: 'access-token',
            refresh: 'refresh-token',
        },
    };

    beforeEach(async () => {
        registerService = jasmine.createSpyObj<RegisterService>('RegisterService', ['register']);
        authService = jasmine.createSpyObj<Pick<AuthService, 'setToken' | 'navigateByRole'>>(
            'AuthService',
            ['setToken', 'navigateByRole'],
        );

        await TestBed.configureTestingModule({
            imports: [RegisterComponent],
            providers: [
                provideRouter([]),
                { provide: RegisterService, useValue: registerService },
                { provide: AuthService, useValue: authService },
            ],
        })
            .overrideComponent(RegisterComponent, {
                set: {
                    template: '',
                },
            })
            .compileComponents();

        fixture = TestBed.createComponent(RegisterComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);
        fixture.detectChanges();
    });

    function fillValidForm(overrides: Partial<RegisterPayload & { confirmPassword: string }> = {}): void {
        component.formGroup.patchValue({
            name: 'Maria Silva',
            email: 'maria@example.com',
            cellphone: '(92) 99999-9999',
            password: 'secret123',
            confirmPassword: 'secret123',
            role: 'ELEITOR',
            ...overrides,
        });
        component.formGroup.updateValueAndValidity();
    }

    it('keeps the form invalid when name is empty', () => {
        fillValidForm({ name: '' });

        expect(component.formGroup.invalid).toBeTrue();
        expect(component.formGroup.get('name')?.hasError('required')).toBeTrue();
    });

    it('keeps the form invalid when email format is incorrect', () => {
        fillValidForm({ email: 'notanemail' });

        expect(component.formGroup.invalid).toBeTrue();
        expect(component.formGroup.get('email')?.hasError('emailError')).toBeTrue();
    });

    it('keeps the form invalid when password and confirmation differ', () => {
        fillValidForm({ confirmPassword: 'different' });

        expect(component.formGroup.invalid).toBeTrue();
        expect(component.formGroup.hasError('passwordNotMatch')).toBeTrue();
        expect(component.formGroup.get('confirmPassword')?.hasError('passwordNotMatch')).toBeTrue();
    });

    it('sends the expected ELEITOR payload by default', () => {
        registerService.register.and.returnValue(of(authResponse));
        fillValidForm();

        component.submit();

        expect(registerService.register).toHaveBeenCalledOnceWith({
            name: 'Maria Silva',
            email: 'maria@example.com',
            cellphone: '(92) 99999-9999',
            password: 'secret123',
            confirm_password: 'secret123',
            role: 'ELEITOR',
        });
    });

    it('sends CANDIDATO when the role toggle is changed', () => {
        registerService.register.and.returnValue(of(authResponse));
        fillValidForm({ role: 'CANDIDATO' });

        component.submit();

        const payload = registerService.register.calls.mostRecent().args[0];
        expect(payload.role).toBe('CANDIDATO');
    });

    it('displays backend email errors inline', () => {
        registerService.register.and.returnValue(throwError(() => ({
            error: {
                email: ['Já existe'],
            },
        })));
        fillValidForm();

        component.submit();

        expect(component.fieldErrors()['email']).toBe('Já existe');
        expect(component.formGroup.get('email')?.hasError('server')).toBeTrue();
        expect(authService.setToken).not.toHaveBeenCalled();
        expect(authService.navigateByRole).not.toHaveBeenCalled();
    });

    it('stores the returned token and delegates role-based redirect', () => {
        registerService.register.and.returnValue(of(authResponse));
        fillValidForm();

        component.submit();

        expect(authService.setToken).toHaveBeenCalledOnceWith(authResponse);
        expect(authService.navigateByRole).toHaveBeenCalled();
    });

    it('does not submit invalid form values', () => {
        component.formGroup.patchValue({
            name: '',
            email: 'invalid',
            cellphone: '',
            password: '',
            confirmPassword: '',
        });

        component.submit();

        expect(registerService.register).not.toHaveBeenCalled();
    });

    it('navigates back to the landing page on cancel', () => {
        spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

        component.cancel();

        expect(router.navigate).toHaveBeenCalledWith(['main']);
    });
});
