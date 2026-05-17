import { Component, Injector, OnInit, inject } from '@angular/core';
import {Voter} from "../../../../../models/core/voter";
import {SafeUrl} from "@angular/platform-browser";
import {Observable, of, takeUntil} from "rxjs";
import {NzMessageService} from "ng-zorro-antd/message";
import { NZ_MODAL_DATA, NzModalService, NzModalFooterDirective } from "ng-zorro-antd/modal";
import {URLS} from "../../../../app/app.urls";
import {CustomValidators} from "../../../../../utilities/validator/custom-validators";
import {Utils} from "../../../../../utilities/utils";
import {BaseComponent} from "../../../base.component";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzFormDirective, NzFormItemComponent, NzFormLabelComponent, NzFormControlComponent } from 'ng-zorro-antd/form';
import { NzRowDirective, NzColDirective } from 'ng-zorro-antd/grid';
import { NzSpaceCompactItemDirective } from 'ng-zorro-antd/space';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzWaveDirective } from 'ng-zorro-antd/core/wave';
import { ɵNzTransitionPatchDirective } from 'ng-zorro-antd/core/transition-patch';
import { NzInputDirective } from 'ng-zorro-antd/input';
import { NgxMaskDirective } from 'ngx-mask';
import { NzIconDirective } from 'ng-zorro-antd/icon';

@Component({
    selector: 'app-voter-item',
    templateUrl: './voter-item.component.html',
    styleUrls: ['./voter-item.component.less'],
    imports: [FormsModule, NzFormDirective, ReactiveFormsModule, NzRowDirective, NzFormItemComponent, NzColDirective, NzSpaceCompactItemDirective, NzButtonComponent, NzWaveDirective, ɵNzTransitionPatchDirective, NzFormLabelComponent, NzFormControlComponent, NzInputDirective, NgxMaskDirective, NzModalFooterDirective, NzIconDirective]
})
export class VoterItemComponent extends BaseComponent<Voter> implements OnInit {
    injector: Injector;
    messageService = inject(NzMessageService);
    modal = inject(NzModalService);
    data = inject(NZ_MODAL_DATA);

    public object: Voter = new Voter();
    public items: Voter[] = [];
    public avatar: SafeUrl;
    public typeImage = ["image/jpeg", "image/png", "image/jpg"];
    public imageCurrent = false;
    public hasImage = false;


    constructor() {
        const injector = inject(Injector);

        super(injector, {pk: "id", endpoint: URLS.VOTE, retrieveOnInit: true});
    
        this.injector = injector;
    }

    public beforeRetrieve(): Observable<number | string> {
        return of(this.data.pk);
    }

    ngOnInit(): void {
        super.ngOnInit(() => {
            if (this.data) {
                this.avatar = this.object.avatar;
            } else {
                this.loadFile();
            }
            if (this.data.voter) {
                this.object = this.data.voter;
            }
        });
    }

    public createFormGroup(): void {
        this.formGroup = this.formBuilder.group({
            avatar: [this.data?.voter?.avatar || null],
            name: [this.data?.voter?.name || null, CustomValidators.compose([CustomValidators.validFieldText])],
            cellphone: [this.data?.voter?.cellphone || null, CustomValidators.required],
            file_name: ['file_name'],
            active: [true],
        });
    }

    public search(): void {
        this.service.getAll().pipe(
            takeUntil(this.unsubscribe)
        ).subscribe(response => {
            this.items = response
        });
    }

    public changeFile(event): void {
        if (event.target.files && event.target.files.length > 0) {
            if (this.typeImage.includes(event.target.files[0].type)) {
                const [file] = event.target.files;
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => {
                    this.imageCurrent = true;
                    this.f.avatar.setValue(file);
                    this.avatar = reader.result;
                    this.hasImage = true;
                };
            }
        }
    }


    public loadFile(): void {
        if (this.object.avatar) {
            this.avatar = Utils.convertBase64ToImage(this.object.avatar);
            const file = Utils.convertImageToBlob(this.avatar, "jpg");
            this.f.avatar.patchValue(file);
        }
    }

    public convertToImage(base64) {
        this.avatar = `data:image/jpg;base64,${base64}`;
    }

    public clearFile(): void {
        this.imageCurrent = false;
        this.avatar = null;
        this.f.avatar.reset();
        this.object.avatar = null;
    }


    public saveOrUpdate(): void {
        if (this.object.avatar && !this.hasImage) {
            this.formGroup.removeControl("avatar");
        }

        if (this.object.id) {
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
