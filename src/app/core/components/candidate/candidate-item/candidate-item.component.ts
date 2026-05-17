import { Component, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import {SafeUrl} from "@angular/platform-browser";
import {Observable, of, takeUntil} from "rxjs";
import {NzMessageService} from "ng-zorro-antd/message";
import { NZ_MODAL_DATA, NzModalService, NzModalFooterDirective } from "ng-zorro-antd/modal";
import {URLS} from "../../../../app/app.urls";
import {CustomValidators} from "../../../../../utilities/validator/custom-validators";
import {Utils} from "../../../../../utilities/utils";
import {BaseComponent} from "../../../base.component";
import {Candidate} from "../../../../../models/core/candidate";
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
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-candidate-item',
    templateUrl: './candidate-item.component.html',
    styleUrls: ['./candidate-item.component.less'],
    imports: [FormsModule, NzFormDirective, ReactiveFormsModule, NzRowDirective, NzFormItemComponent, NzColDirective, NzSpaceCompactItemDirective, NzButtonComponent, NzWaveDirective, ɵNzTransitionPatchDirective, NzFormLabelComponent, NzFormControlComponent, NzInputDirective, NgxMaskDirective, NzModalFooterDirective, NzIconDirective]
})
export class CandidateItemComponent extends BaseComponent<Candidate> implements OnInit {
    messageService = inject(NzMessageService);
    modal = inject(NzModalService);
    data = inject(NZ_MODAL_DATA);

    public items: Candidate[] = [];
    public avatar: SafeUrl;
    public typeImage = ["image/jpeg", "image/png", "image/jpg"];
    public imageCurrent = false;
    public hasImage = false;


    constructor() {

        super({pk: "id", endpoint: URLS.CANDIDATE, retrieveOnInit: true});
    
    }

    public beforeRetrieve(): Observable<number | string> {
        return of(this.data.pk);
    }

    ngOnInit(): void {
        super.ngOnInit(() => {
            if (this.data) {
                this.avatar = this.object().avatar;
            } else {
                this.loadFile();
            }
            if(this.data.candidate) {
                this.object.set(this.data.candidate);
            }
        })

    }

    public createFormGroup(): void {
        this.formGroup = this.formBuilder.group({
            avatar: [this.data?.candidate ? this.data?.candidate?.avatar : null],
            name: [this.data?.candidate ? this.data?.candidate?.name : null, CustomValidators.compose([
                CustomValidators.required,
                CustomValidators.validFieldText
            ])],
            cellphone: [this.data?.candidate ? this.data?.candidate?.cellphone : null],
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
        if (this.object().avatar) {
            this.avatar = Utils.convertBase64ToImage(this.object().avatar);
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
        this.object.update(obj => ({ ...obj, avatar: null }));
    }


    public saveOrUpdate(): void {

        if (this.object().avatar && !this.hasImage) {
            this.formGroup.removeControl("avatar");
        }

        super.saveOrUpdateFormData((event) => {
            this.message('success')
            this.modal.closeAll();
        });
    }


    public cancel(): void {
        this.modal.closeAll();
    }

    public message(type: string): void {
        if (type === 'success') {
            this.messageService.create(type, `Candidato salvo com sucesso`);
        } else {
            this.messageService.create(type, `Favor preencher o campo.`);
        }
    }

}
