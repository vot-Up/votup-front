import {Component, Inject, Injector, OnInit} from '@angular/core';
import {CdkDragDrop, transferArrayItem} from "@angular/cdk/drag-drop";
import {Plate} from "../../../../../models/core/plate";
import {URLS} from "../../../../app/app.urls";
import {takeUntil} from "rxjs";
import {BaseComponent} from "../../../base.component";
import {BaseService} from "../../../../../services/base.service";
import {PlateUser} from "../../../../../models/core/plate-user";
import {NzMessageService} from "ng-zorro-antd/message";
import {NZ_MODAL_DATA, NzModalService} from "ng-zorro-antd/modal";
import {CustomValidators} from "../../../../../utilities/validator/custom-validators";
import {Candidate} from "../../../../../models/core/candidate";


@Component({
  standalone: false,
    selector: 'app-plate-item',
    templateUrl: './plate-item.component.html',
    styleUrls: ['./plate-item.component.less']
})
export class PlateItemComponent extends BaseComponent<Plate> implements OnInit {

    public type: string;
    public object = new Plate();

    public candidates: Candidate[] = [];
    public presidents: Candidate[] = [];
    public vice_presidents: Candidate[] = [];

    public candidateService: BaseService<Candidate>;
    public plateUserService: BaseService<PlateUser>;
    public hide = true;
    public searchUser: string;

    constructor(public injector: Injector,
                private modalService: NzModalService,
                public messageService: NzMessageService,
                @Inject(NZ_MODAL_DATA) public data: any
    ) {
        super(injector, {pk: "id", endpoint: URLS.PLATE, retrieveOnInit: true});
        this.candidateService = this.createService(Candidate, URLS.CANDIDATE);
        this.plateUserService = this.createService(PlateUser, URLS.PLATE_USER)
    }

    ngOnInit() {
        if (this.data) {
            this.object = this.data.plate;
            this.hide = !this.hide;
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
            plateUser.plate = this.object.id;
            plateUser.candidate = event.container.data[event.currentIndex].id;
            this.deletePlateUser(plateUser);
        } else {
            plateUser.plate = this.object.url;
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
    }

    public getCandidates(): void {
        this.candidateService.clearParameter();
        this.candidateService.addParameter("active", true);
        this.candidateService.addParameter("exists", this.object.id);
        if (this.searchUser) this.candidateService.addParameter("name", this.searchUser);
        this.candidateService.getAll()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((response) => {
                this.candidates = response;
            });
    }

    public getPresidents(): void {
        this.candidateService.clearParameter();
        this.candidateService.addParameter("active", true);
        this.candidateService.addParameter("plate_president", this.object.id);
        this.candidateService.getAll()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((response) => {
                if (response) {
                    this.presidents = response;
                }
            })
    }

    public getVicePresidents(): void {
        this.candidateService.clearParameter();
        this.candidateService.addParameter("is_active", true);
        this.candidateService.addParameter("plate_vice", this.object.id);
        this.candidateService.getAll()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((response) => {
                if (response) {
                    this.vice_presidents = response;
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
        if (!this.object.id) {
            super.saveOrUpdate(() => {
                this.getCandidates();
                this.hide = false;
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
