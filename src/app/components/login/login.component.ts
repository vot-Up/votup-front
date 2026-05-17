import { Component, ChangeDetectionStrategy, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {CustomValidators} from "../../../utilities/validator/custom-validators";
import {take} from "rxjs/operators";
import {AuthService} from "../../../services/auth.service";
import { NzFormDirective, NzFormItemComponent, NzFormControlComponent } from 'ng-zorro-antd/form';
import { ɵNzTransitionPatchDirective } from 'ng-zorro-antd/core/transition-patch';
import { NzInputGroupComponent, NzInputDirective } from 'ng-zorro-antd/input';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzAlertComponent } from 'ng-zorro-antd/alert';
import { NzWaveDirective } from 'ng-zorro-antd/core/wave';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.less'],
    imports: [FormsModule, NzFormDirective, ReactiveFormsModule, NzFormItemComponent, NzFormControlComponent, ɵNzTransitionPatchDirective, NzInputGroupComponent, NzInputDirective, NzButtonComponent, NzAlertComponent, NzWaveDirective]
})
export class LoginComponent implements OnInit {
    formBuilder = inject(FormBuilder);
    router = inject(Router);
    authService = inject(AuthService);
    route = inject(ActivatedRoute);


    public url = signal<string>("/");
    public message = signal<string>("sign-in");
    public formGroup: FormGroup
    public hide = signal(true);
    public test = signal(false);

    ngOnInit(): void {
        this.createFormGroup();
        this.message.set("sign-in");
        this.url.set(this.route.snapshot.queryParams["u"] || "/");
    }

    public createFormGroup(): void {
        this.formGroup = this.formBuilder.group({
            email: [null, CustomValidators.required],
            password: [null, CustomValidators.required]
        })
    }

    public login(): void {
        this.message.set("processing");
        const rawValue = this.formGroup.getRawValue();

        this.authService.login(rawValue.email, rawValue.password)
            .pipe(take(1))
            .subscribe(() => {
                    if (this.formGroup.valid) {
                        this.router.navigate(["core/users"]).then();
                        this.playSound();
                    }
                },
                () => {
                    this.message.set("sign-in");
                    this.test.set(true);
                    this.formGroup.reset()
                }
            );
    }

    playSound() {
        const audioElement = document.getElementById('audioElement') as HTMLAudioElement;
        audioElement.play();
    }
}
