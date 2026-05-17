import { Component, ChangeDetectionStrategy, OnInit, inject, signal } from '@angular/core';
import {Voter} from "../../../../../models/core/voter";
import {SafeUrl} from "@angular/platform-browser";
import {Observable, of, takeUntil} from "rxjs";
import {NzMessageService} from "ng-zorro-antd/message";
import { NZ_MODAL_DATA, NzModalService } from "ng-zorro-antd/modal";
import {URLS} from "../../../../app/app.urls";
import {CustomValidators} from "../../../../../utilities/validator/custom-validators";
import {Utils} from "../../../../../utilities/utils";
import {BaseComponent} from "../../../base.component";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzFormDirective, NzFormItemComponent, NzFormLabelComponent, NzFormControlComponent } from 'ng-zorro-antd/form';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzWaveDirective } from 'ng-zorro-antd/core/wave';
import { ɵNzTransitionPatchDirective } from 'ng-zorro-antd/core/transition-patch';
import { NzInputDirective } from 'ng-zorro-antd/input';
import { NgxMaskDirective } from 'ngx-mask';
import { NzIconDirective } from 'ng-zorro-antd/icon';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-voter-item',
    templateUrl: './voter-item.component.html',
    styleUrls: ['./voter-item.component.less'],
    imports: [FormsModule, NzFormDirective, ReactiveFormsModule, NzFormItemComponent, NzButtonComponent, NzWaveDirective, ɵNzTransitionPatchDirective, NzFormLabelComponent, NzFormControlComponent, NzInputDirective, NgxMaskDirective, NzIconDirective]
})
export class VoterItemComponent extends BaseComponent<Voter> implements OnInit {
    messageService = inject(NzMessageService);
    modal = inject(NzModalService);
    data = inject(NZ_MODAL_DATA);

    public items = signal<Voter[]>([]);
    public avatar = signal<SafeUrl | null>(null);
    public typeImage = ["image/jpeg", "image/png", "image/jpg"];
    public imageCurrent = signal(false);
    public hasImage = signal(false);


    constructor() {

        super({pk: "id", endpoint: URLS.VOTE, retrieveOnInit: true});
    
    }

    public beforeRetrieve(): Observable<number | string> {
        return of(this.data.pk);
    }

    ngOnInit(): void {
        super.ngOnInit(() => {
            if (this.data) {
                this.avatar.set(this.object().avatar);
            } else {
                this.loadFile();
            }
            if (this.data.voter) {
                this.object.set(this.data.voter);
            }
        });
    }

    public createFormGroup(): void {
        this.formGroup = this.formBuilder.group({
            avatar: [this.data?.voter?.avatar || null],
            name: [this.data?.voter?.name || null, CustomValidators.compose([CustomValidators.required, CustomValidators.validFieldText])],
            cellphone: [this.data?.voter?.cellphone || null, CustomValidators.required],
            file_name: ['file_name'],
            active: [true],
        });
    }

    public search(): void {
        this.service.getAll().pipe(
            takeUntil(this.unsubscribe)
        ).subscribe(response => {
            this.items.set(response)
        });
    }

    public changeFile(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            if (this.typeImage.includes(input.files[0].type)) {
                const file = input.files[0];
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => {
                    this.imageCurrent.set(true);
                    this.f.avatar.setValue(file);
                    this.avatar.set(reader.result as string);
                    this.hasImage.set(true);
                };
            }
        }
    }


    public loadFile(): void {
        if (this.object().avatar) {
            this.avatar.set(Utils.convertBase64ToImage(this.object().avatar));
            const file = Utils.convertImageToBlob(this.avatar(), "jpg");
            this.f.avatar.patchValue(file);
        }
    }

    public convertToImage(base64: string): void {
        this.avatar.set(`data:image/jpg;base64,${base64}`);
    }

    public clearFile(input?: HTMLInputElement): void {
        this.imageCurrent.set(false);
        this.avatar.set(null);
        this.f.avatar.reset();
        if (input) {
            input.value = '';
        }
        this.object.update(obj => ({ ...obj, avatar: null }));
    }

    public scrollFocusedControlIntoView(event: FocusEvent): void {
        const target = event.target as HTMLElement | null;
        if (!target || !target.matches('input, textarea, nz-select, button')) {
            return;
        }

        window.setTimeout(() => {
            target.scrollIntoView({block: 'center', inline: 'nearest'});
        }, 80);
    }


    public saveOrUpdate(): void {
        if (this.object().avatar && !this.hasImage()) {
            this.formGroup.removeControl("avatar");
        }

        if (this.object().id) {
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
            this.messageService.create(type, `Eleitor criado com sucesso`);
        } else {
            this.messageService.create(type, `Favor preencher o campo.`);
        }
    }
}
