import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {CustomValidators} from "../../../utilities/validator/custom-validators";
import {User} from "../../../models/core/user";
import {BaseComponent} from "../../core/base.component";
import {URLS} from "../../app/app.urls";
import {NzMessageService} from "ng-zorro-antd/message";
import {BaseService} from "../../../services/base.service";
import {takeUntil} from "rxjs";
import { NzFormDirective, NzFormItemComponent, NzFormControlComponent } from 'ng-zorro-antd/form';
import { ɵNzTransitionPatchDirective } from 'ng-zorro-antd/core/transition-patch';
import { NzInputGroupComponent, NzInputDirective } from 'ng-zorro-antd/input';
import { LowercaseDirective } from '../../../utilities/lowercase.directive';
import { NgxMaskDirective } from 'ngx-mask';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzWaveDirective } from 'ng-zorro-antd/core/wave';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-reset-password',
    templateUrl: './reset-password.component.html',
    styleUrls: ['./reset-password.component.less'],
    imports: [FormsModule, NzFormDirective, ReactiveFormsModule, NzFormItemComponent, NzFormControlComponent, ɵNzTransitionPatchDirective, NzInputGroupComponent, NzInputDirective, LowercaseDirective, NgxMaskDirective, NzButtonComponent, NzWaveDirective]
})
export class ResetPasswordComponent extends BaseComponent<User> {
    messageService = inject(NzMessageService);

    public isResetPassword = signal(false);
    public serviceUser: BaseService<User>
    public hide = signal(true);

    constructor() {

        super({endpoint: URLS.USER});

        this.serviceUser = this.createService(URLS.USER);
    }

    public createFormGroup(): void {
        this.formGroup = this.formBuilder.group({
            cellphone: [null, Validators.required],
            email: [null, [Validators.required, CustomValidators.validEmail]],
            new_password: [null, Validators.required]
        });
    }

    public getValidUser() {
        const payload = {
            "cellphone": this.v.cellphone,
            "email": this.v.email,
            "new_password": this.v.new_password
        }
        this.service.postFromListRoute("reset_password", payload)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(response => {
                this.messageService.create("success", response['message'])
            })
        this.message('success');
        this.router.navigate(['login']).then();
    }

    public message(type: string): void {
        if (type === 'success') {
            this.messageService.create(type, `Senha editada com sucesso`);
        } else {
            this.messageService.create(type, `Senha incorreta por favor preencher o campo.`);
        }
    }

}
