import { Component, ChangeDetectionStrategy, OnInit, inject, signal } from '@angular/core';
import { CdkDragDrop, transferArrayItem, CdkDropListGroup, CdkDropList, CdkDrag } from "@angular/cdk/drag-drop";
import {Plate} from "../../../../../models/core/plate";
import {URLS} from "../../../../app/app.urls";
import {takeUntil} from "rxjs";
import {BaseComponent} from "../../../base.component";
import {BaseService} from "../../../../../services/base.service";
import {PlateUser} from "../../../../../models/core/plate-user";
import {NzMessageService} from "ng-zorro-antd/message";
import { NZ_MODAL_DATA, NzModalService, NzModalFooterDirective } from "ng-zorro-antd/modal";
import {CustomValidators} from "../../../../../utilities/validator/custom-validators";
import {Candidate} from "../../../../../models/core/candidate";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzFormDirective, NzFormControlComponent, NzFormLabelComponent } from 'ng-zorro-antd/form';
import { NzColDirective, NzRowDirective } from 'ng-zorro-antd/grid';
import { NzSpaceCompactItemDirective } from 'ng-zorro-antd/space';
import { NzInputDirective, NzInputGroupComponent } from 'ng-zorro-antd/input';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzWaveDirective } from 'ng-zorro-antd/core/wave';
import { ɵNzTransitionPatchDirective } from 'ng-zorro-antd/core/transition-patch';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzAvatarComponent } from 'ng-zorro-antd/avatar';


@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-plate-item',
    templateUrl: './plate-item.component.html',
    styleUrls: ['./plate-item.component.less'],
    imports: [FormsModule, NzFormDirective, ReactiveFormsModule, NzColDirective, NzFormControlComponent, NzFormLabelComponent, NzSpaceCompactItemDirective, NzInputDirective, NzButtonComponent, NzWaveDirective, ɵNzTransitionPatchDirective, NzIconDirective, CdkDropListGroup, NzRowDirective, NzInputGroupComponent, CdkDropList, CdkDrag, NzAvatarComponent, NzModalFooterDirective]
})
export class PlateItemComponent extends BaseComponent<Plate> implements OnInit {
    private modalService = inject(NzModalService);
    messageService = inject(NzMessageService);
    data = inject(NZ_MODAL_DATA);


    public type: string;

    public candidates = signal<Candidate[]>([]);
    public presidents = signal<Candidate[]>([]);
    public vice_presidents = signal<Candidate[]>([]);

    public candidateService: BaseService<Candidate>;
    public plateUserService: BaseService<PlateUser>;
    public hide = signal(true);
    public searchUser = signal('');

    constructor() {

        super({pk: "id", endpoint: URLS.PLATE, retrieveOnInit: true});

        this.candidateService = this.createService(URLS.CANDIDATE);
        this.plateUserService = this.createService(URLS.PLATE_USER)
    }

    ngOnInit() {
        if (this.data) {
            this.object.set(this.data.plate);
            this.hide.update(value => !value);
            this.getPresidents();
            this.getVicePresidents();
            this.getCandidates();
        }
        this.createFormGroup();
    }

    createFormGroup(): void {
        this.formGroup = this.formBuilder.group({
            name: [this.object?.name, CustomValidators.required]
        })
    }

    public dropItem(event: CdkDragDrop<Candidate[]>) {
        const origin = event.previousContainer.id;
        const destination = event.container.id;

        if (event.previousContainer !== event.container) {
            if (destination === 'U' || (event.container.data.length < 1
                && !(origin === 'P' && destination === 'V') && !(origin === 'V' && destination === 'P'))) {
                this.transferItem(event);
                this.handleTransfer(event, destination);
            } else {
                this.showMessageForRole(destination, origin);
            }
        }
    }

    private handleTransfer(event: CdkDragDrop<Candidate[]>, destination: string): void {
        const plateUser: PlateUser = new PlateUser();

        if (destination === 'U') {
            plateUser.plate = this.object().id;
            plateUser.candidate = event.container.data[event.currentIndex].id;
            this.deletePlateUser(plateUser);
        } else {
            plateUser.plate = this.object().url;
            plateUser.type = destination;
            plateUser.candidate = event.container.data[event.currentIndex].url;
            this.savePlateUser(plateUser);
        }
    }

    private showMessageForRole(destination: string, origin: string): void {
        const roles = {
            'P': 'Presidente',
            'V': 'Vice-presidente'
        };
        const role = roles[destination] || destination;
        const originRole = roles[origin] || origin;

        if ((origin === 'P' && destination === 'V') || (origin === 'V' && destination === 'P')) {
            this.messageService.create(
                'warning',
                `É necessário remover o usuário da função ${originRole} antes disso!`
            );
        } else if (destination === 'P' || destination === 'V') {
            this.messageService.create('warning', `Essa chapa já contém um ${role}`);
        }
    }

    private transferItem(event) {
        transferArrayItem(
            event.previousContainer.data,
            event.container.data,
            event.previousIndex,
            event.currentIndex,
        );
        this.candidates.set([...this.candidates()]);
        this.presidents.set([...this.presidents()]);
        this.vice_presidents.set([...this.vice_presidents()]);
    }

    public getCandidates(): void {
        this.candidateService.clearParameter();
        this.candidateService.addParameter("active", true);
        this.candidateService.addParameter("exists", this.object().id);
        if (this.searchUser()) this.candidateService.addParameter("name", this.searchUser());
        this.candidateService.getAll()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((response) => {
                this.candidates.set(response);
            });
    }

    public getPresidents(): void {
        this.candidateService.clearParameter();
        this.candidateService.addParameter("active", true);
        this.candidateService.addParameter("plate_president", this.object().id);
        this.candidateService.getAll()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((response) => {
                if (response) {
                    this.presidents.set(response);
                }
            })
    }

    public getVicePresidents(): void {
        this.candidateService.clearParameter();
        this.candidateService.addParameter("is_active", true);
        this.candidateService.addParameter("plate_vice", this.object().id);
        this.candidateService.getAll()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((response) => {
                if (response) {
                    this.vice_presidents.set(response);
                }
            })
    }

    public savePlateUser(payload = new PlateUser()): void {
        this.plateUserService.clearParameter()
        this.plateUserService.save(payload)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe();
    }

    public deletePlateUser(payload = new PlateUser()): void {
        this.plateUserService.clearParameter();
        this.plateUserService.deleteFromListRoute("delete_user_plate", payload)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe();
    }

    public savePlate(isClose = false) {
        if (!this.object().id) {
            super.saveOrUpdate(() => {
                this.getCandidates();
                this.hide.set(false);
                this.messageService.create(
                    'success',
                    `Chapa criada, associe o presidente e o vice-presidente`
                );
            });
        } else {
            super.saveOrUpdate(() => {
                this.messageService.create(
                    'success',
                    `A chapa foi atualizada com sucesso!`
                );
                if (isClose) this.modalService.closeAll();
            });
        }
    }

    public close(): void {
        this.modalService.closeAll()
    }
}
