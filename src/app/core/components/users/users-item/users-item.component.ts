import { Component, ChangeDetectionStrategy, OnInit, inject, signal } from '@angular/core';
import {BaseComponent} from "../../../base.component";
import {User} from "../../../../../models/core/user";
import {URLS} from "../../../../app/app.urls";
import {takeUntil} from "rxjs";
import {NzMessageService} from "ng-zorro-antd/message";
import { NZ_MODAL_DATA, NzModalService, NzModalFooterDirective } from "ng-zorro-antd/modal";
import {SafeUrl} from "@angular/platform-browser";
import {CustomValidators} from "../../../../../utilities/validator/custom-validators";
import {Utils} from "../../../../../utilities/utils";
import {AuthService} from "../../../../../services/auth.service";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzFormDirective, NzFormItemComponent, NzFormLabelComponent, NzFormControlComponent } from 'ng-zorro-antd/form';
import { NzRowDirective, NzColDirective } from 'ng-zorro-antd/grid';
import { NzSpaceCompactItemDirective } from 'ng-zorro-antd/space';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzWaveDirective } from 'ng-zorro-antd/core/wave';
import { ɵNzTransitionPatchDirective } from 'ng-zorro-antd/core/transition-patch';
import { NzInputDirective, NzInputGroupComponent } from 'ng-zorro-antd/input';
import { LowercaseDirective } from '../../../../../utilities/lowercase.directive';
import { NgxMaskDirective } from 'ngx-mask';
import { NzSwitchComponent } from 'ng-zorro-antd/switch';
import { NzIconDirective } from 'ng-zorro-antd/icon';


interface DialogData {
    pk: number,
    user: User,
    isUpdate: boolean
}


@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-users-item',
    templateUrl: './users-item.component.html',
    styleUrls: ['./users-item.component.less'],
    imports: [FormsModule, NzFormDirective, ReactiveFormsModule, NzRowDirective, NzFormItemComponent, NzColDirective, NzSpaceCompactItemDirective, NzButtonComponent, NzWaveDirective, ɵNzTransitionPatchDirective, NzFormLabelComponent, NzFormControlComponent, NzInputDirective, LowercaseDirective, NgxMaskDirective, NzSwitchComponent, NzInputGroupComponent, NzModalFooterDirective, NzIconDirective]
})
export class UsersItemComponent extends BaseComponent<User> implements OnInit {
    messageService = inject(NzMessageService);
    modal = inject(NzModalService);
    authService = inject(AuthService);
    data = inject<DialogData>(NZ_MODAL_DATA);


    public items = signal<User[]>([]);
    public avatar = signal<SafeUrl | null>(null);
    public typeImage = ["image/jpeg", "image/png", "image/jpg"];
    public imageCurrent = signal(false);
    public hasImage = signal(false);
    public hide = signal(true);
    public isEdit = signal(false);
    public isLogged = signal(false);

    constructor() {

        super({pk: "id", endpoint: URLS.USER, retrieveOnInit: true});
    
    }

    ngOnInit(): void {
        super.ngOnInit(() => {
            if (this.data) {
                this.formGroup.reset(this.data.user);
                this.isLogged.set(true);
                this.avatar.set(this.data.user.avatar);
            } else {
                this.loadFile();
            }
            if (this.data.user) {
                this.object.set(this.data.user);
            }

        });
    }


    public createFormGroup(): void {
        this.formGroup = this.formBuilder.group({
            avatar: [this.data?.user ? this.data?.user?.avatar : null],
            name: [this.data?.user ? this.data?.user?.name : null, CustomValidators.compose([
                CustomValidators.required,
                CustomValidators.validFieldText
            ])],
            email: [this.data?.user ? this.data?.user?.email : null, CustomValidators.compose([
                CustomValidators.validEmail
            ])],
            cellphone: [this.data?.user ? this.data?.user?.cellphone : null],
            file_name: ['file_name'],
            password: [123456],
            is_active: [true],
            is_superuser: [this.data?.user ? this.data?.user?.is_superuser : false]
        });
    }

    public search(): void {
        this.service.getAll()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(response => {
                this.items.set(response);
            });
    }

    public changeFile(event): void {
        if (event.target.files && event.target.files.length > 0) {
            if (this.typeImage.includes(event.target.files[0].type)) {
                const [file] = event.target.files;
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => {
                    this.imageCurrent.set(true);
                    this.f.avatar.setValue(file);
                    this.avatar.set(reader.result);
                    this.hasImage.set(true);
                };
            }
        }
    }

    public loadFile(): void {
        if (this.object().avatar) {
            const avatar = Utils.convertBase64ToImage(this.object().avatar);
            this.avatar.set(avatar);
            const file = Utils.convertImageToBlob(avatar, "jpg");
            this.f.avatar.patchValue(file);
        }
    }

    public clearFile(): void {
        this.imageCurrent.set(false);
        this.avatar.set(null);
        this.f.avatar.reset();
        this.object.update(obj => ({ ...obj, avatar: null }));
    }


    public saveOrUpdate(): void {
        if (this.object().avatar && !this.hasImage()) {
            this.formGroup.removeControl("avatar");
        }

        if (this.object().password) {
            this.formGroup.removeControl("password");
        }

        super.saveOrUpdateFormData(() => {
            this.message('success')
            this.modal.closeAll();
        });
    }


    public cancel(): void {
        this.modal.closeAll();
    }

    public message(type: string): void {
        if (type === 'success') {
            this.messageService.create(type, `Usuario salvo com sucesso`);
        } else {
            this.messageService.create(type, `Favor preencher o campo.`);
        }
    }


}
