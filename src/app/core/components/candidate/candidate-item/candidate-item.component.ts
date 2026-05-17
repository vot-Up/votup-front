import {Component, Inject, Injector, OnInit} from '@angular/core';
import {SafeUrl} from "@angular/platform-browser";
import {Observable, of, takeUntil} from "rxjs";
import {NzMessageService} from "ng-zorro-antd/message";
import {NZ_MODAL_DATA, NzModalService} from "ng-zorro-antd/modal";
import {URLS} from "../../../../app/app.urls";
import {CustomValidators} from "../../../../../utilities/validator/custom-validators";
import {Utils} from "../../../../../utilities/utils";
import {BaseComponent} from "../../../base.component";
import {Candidate} from "../../../../../models/core/candidate";


@Component({
  standalone: false,
    selector: 'app-candidate-item',
    templateUrl: './candidate-item.component.html',
    styleUrls: ['./candidate-item.component.less']
})
export class CandidateItemComponent extends BaseComponent<Candidate> implements OnInit {
    public object: Candidate = new Candidate();
    public items: Candidate[] = [];
    public avatar: SafeUrl;
    public typeImage = ["image/jpeg", "image/png", "image/jpg"];
    public imageCurrent = false;
    public hasImage = false;
    public selectedFile: File;


    constructor(public injector: Injector,
                public messageService: NzMessageService,
                public modal: NzModalService,
                @Inject(NZ_MODAL_DATA) public data: any) {
        super(injector, {pk: "id", endpoint: URLS.CANDIDATE, retrieveOnInit: true});
    }

    public beforeRetrieve(): Observable<number | string> {
        return of(this.data.pk);
    }

    ngOnInit(): void {
        super.ngOnInit(() => {
            if (this.data) {
                this.avatar = this.object.avatar_url;
            } else {
                this.loadFile();
            }
            if(this.data.candidate) {
                this.object = this.data.candidate;
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
            const [file] = event.target.files;
            if (this.typeImage.includes(file.type)) {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => {
                    this.imageCurrent = true;
                    this.f.avatar.setValue(file);
                    this.avatar = reader.result;
                    this.selectedFile = file;
                    this.hasImage = true;
                };
            }
        }
    }



    public loadFile(): void {
        if (this.object.avatar_url) {
            this.avatar = Utils.convertBase64ToImage(this.object.avatar_url);
            const blob = Utils.convertImageToBlob(this.avatar, "jpg");
            const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });

            this.f.avatar.patchValue(file);
            this.selectedFile = file;
            this.hasImage = true;
        }
    }

    public convertToImage(base64) {
        this.avatar = `data:image/jpg;base64,${base64}`;
    }

    public clearFile(): void {
        this.imageCurrent = false;
        this.avatar = null;
        this.f.avatar.reset();
        this.object.avatar_url = null;
    }


    public saveOrUpdate(): void {
        if (this.object.avatar_url && !this.hasImage) {
            this.formGroup.removeControl("avatar");
        }

        super.saveOrUpdateFormData((event: any) => {
            this.message('success');

            const candidateId = event.body?.id || this.object.id;

            if (this.hasImage && this.selectedFile) {
                const formData = new FormData();
                formData.append('avatar', this.selectedFile, this.selectedFile.name);  // ✅ CORRETO!

                this.service.postFromDetailRoute(candidateId, 'upload-avatar', formData)
                    .pipe(takeUntil(this.unsubscribe))
                    .subscribe(() => {
                        this.modal.closeAll();
                    });
            } else {
                this.modal.closeAll();
            }
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
