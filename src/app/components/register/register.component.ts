import { Component, ChangeDetectionStrategy, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { take } from 'rxjs/operators';
import { AuthService } from '../../../services/auth.service';
import { RegisterService, RegisterPayload } from '../../../services/register.service';
import { CustomValidators } from '../../../utilities/validator/custom-validators';
import { NzFormDirective, NzFormItemComponent, NzFormControlComponent } from 'ng-zorro-antd/form';
import { ɵNzTransitionPatchDirective } from 'ng-zorro-antd/core/transition-patch';
import { NzInputGroupComponent, NzInputDirective } from 'ng-zorro-antd/input';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzAlertComponent } from 'ng-zorro-antd/alert';
import { NzWaveDirective } from 'ng-zorro-antd/core/wave';
import { NgxMaskDirective } from 'ngx-mask';
import { NzRadioModule } from 'ng-zorro-antd/radio';

interface RegisterErrorResponse {
  [field: string]: string[];
}

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;
  if (!confirmPassword) {
    return null;
  }
  if (password !== confirmPassword) {
    group.get('confirmPassword')?.setErrors({ passwordNotMatch: true });
    return { passwordNotMatch: true };
  }
  return null;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.less'],
  imports: [
    FormsModule,
    NzFormDirective,
    ReactiveFormsModule,
    NzFormItemComponent,
    NzFormControlComponent,
    ɵNzTransitionPatchDirective,
    NzInputGroupComponent,
    NzInputDirective,
    NzButtonComponent,
    NzAlertComponent,
    NzWaveDirective,
    NgxMaskDirective,
    NzRadioModule,
    RouterModule,
  ]
})
export class RegisterComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private registerService = inject(RegisterService);

  public formGroup: FormGroup;
  public errorMessage = signal<string | null>(null);
  public fieldErrors = signal<Record<string, string>>({});
  public isSubmitting = signal(false);

  ngOnInit(): void {
    this.createFormGroup();
  }

  public createFormGroup(): void {
    this.formGroup = this.formBuilder.group({
      name: [null, CustomValidators.required],
      email: [null, [CustomValidators.required, CustomValidators.validEmail]],
      cellphone: [null, CustomValidators.required],
      password: [null, CustomValidators.required],
      confirmPassword: [null, [CustomValidators.required]],
      role: ['ELEITOR' as const],
    }, { validators: passwordMatchValidator });
  }

  public submit(): void {
    if (this.formGroup.invalid) {
      Object.values(this.formGroup.controls).forEach(c => c.markAsDirty());
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.fieldErrors.set({});

    const rawValue = this.formGroup.getRawValue();
    const payload: RegisterPayload = {
      name: rawValue.name,
      email: rawValue.email,
      cellphone: rawValue.cellphone,
      password: rawValue.password,
      confirm_password: rawValue.confirmPassword,
      role: rawValue.role,
    };

    this.registerService.register(payload)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.authService.setToken(response);
          this.authService.navigateByRole();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          if (err.error && typeof err.error === 'object') {
            const errors: Record<string, string> = {};
            const raw: RegisterErrorResponse = err.error;
            Object.keys(raw).forEach(key => {
              const messages = raw[key];
              if (Array.isArray(messages)) {
                errors[key] = messages[0];
              } else if (typeof messages === 'string') {
                errors[key] = messages;
              }
            });
            this.fieldErrors.set(errors);

            if (errors['confirm_password']) {
              this.formGroup.get('confirmPassword')?.setErrors({ server: errors['confirm_password'] });
            }
            if (errors['email']) {
              this.formGroup.get('email')?.setErrors({ server: errors['email'] });
            }
            if (errors['cellphone']) {
              this.formGroup.get('cellphone')?.setErrors({ server: errors['cellphone'] });
            }
            if (errors['non_field_errors'] || errors['detail']) {
              this.errorMessage.set(errors['non_field_errors'] || errors['detail']);
            }
          } else {
            this.errorMessage.set('Erro ao criar conta. Tente novamente.');
          }
        }
      });
  }

  public cancel(): void {
    this.router.navigate(['main']).then();
  }
}
