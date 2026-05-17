import { CdkDragDrop, transferArrayItem, CdkDropList, CdkDrag } from "@angular/cdk/drag-drop";
import {BaseComponent} from "../../../base.component";
import { NZ_MODAL_DATA, NzModalService, NzModalFooterDirective } from "ng-zorro-antd/modal";
import {NzMessageService} from "ng-zorro-antd/message";
import {URLS} from "../../../../app/app.urls";
import {CustomValidators} from "../../../../../utilities/validator/custom-validators";
import {BaseService} from "../../../../../services/base.service";
import {Voting} from "../../../../../models/core/voting";
import {Observable, of, takeUntil} from "rxjs";
import {Component, EventEmitter, Inject, Injector, OnInit} from "@angular/core";
import {VotingPlate} from "../../../../../models/core/voting-plate";
import {Plate} from "../../../../../models/core/plate";
import {DatePipe} from "@angular/common";
import {Candidate} from "../../../../../models/core/candidate";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NzFormDirective, NzFormItemComponent, NzFormLabelComponent, NzFormControlComponent } from "ng-zorro-antd/form";
import { NzRowDirective, NzColDirective } from "ng-zorro-antd/grid";
import { NzSpaceCompactItemDirective } from "ng-zorro-antd/space";
import { NzDatePickerComponent } from "ng-zorro-antd/date-picker";
import { NzInputDirective } from "ng-zorro-antd/input";
import { NzButtonComponent } from "ng-zorro-antd/button";
import { NzWaveDirective } from "ng-zorro-antd/core/wave";
import { ɵNzTransitionPatchDirective } from "ng-zorro-antd/core/transition-patch";
import { NzIconDirective } from "ng-zorro-antd/icon";
import { NzAvatarComponent } from "ng-zorro-antd/avatar";


enum DropListTypes {
    ALL, ADDED
}

@Component({
    selector: 'app-vote-item',
    templateUrl: './vote-item.component.html',
    styleUrls: ['./vote-item.component.less'],
    imports: [FormsModule, NzFormDirective, ReactiveFormsModule, NzRowDirective, NzColDirective, NzFormItemComponent, NzFormLabelComponent, NzSpaceCompactItemDirective, NzDatePickerComponent, NzFormControlComponent, NzInputDirective, NzButtonComponent, NzWaveDirective, ɵNzTransitionPatchDirective, NzIconDirective, CdkDropList, CdkDrag, NzAvatarComponent, NzModalFooterDirective]
})
export class VoteItemComponent extends BaseComponent<Voting> implements OnInit {
    public plateService: BaseService<Plate>;
    public votingPlateService: BaseService<VotingPlate>;
    public object = new Voting();
    public plate_added: Plate[] = [];
    public items: Voting[] = [];
    public plates: Plate[] = [];
    public dropTypes = DropListTypes;
    public hide: boolean = false;
    public test: Plate[] = []
    private datePipe: DatePipe;
    public modalClosedEmitter: EventEmitter<void> = new EventEmitter<void>();
    private disableInput = true;


    constructor(public injector: Injector,
                private modalService: NzModalService,
                public messageService: NzMessageService,
                @Inject(NZ_MODAL_DATA) public data: any
    ) {
        super(injector, {
            pk: "id", endpoint: URLS.VOTING, retrieveOnInit: true
        });
        this.plateService = this.createService(Plate, URLS.PLATE);
        this.votingPlateService = this.createService(VotingPlate, URLS.VOTING_PLATE)
    }

    public beforeRetrieve(): Observable<number | string> {
        return of(this.data.pk);
    }

    ngOnInit() {
        super.ngOnInit();
        if (this.data.voting) {
            this.object = this.data.voting;
            this.hide = !this.hide;
            this.getPlates();
            this.getPlatesAssociate();
        }
    }


    createFormGroup(): void {
        this.formGroup = this.formBuilder.group({
            description: [this.object.description, CustomValidators.compose([CustomValidators.required])],
            date: [this.object.date]
        })


    }

    public getPlates(): void {
        this.plateService.clearParameter();
        this.plateService.addParameter("exists", this.object.id);
        this.plateService.addParameter("active", true);
        this.plateService.addParameter("expand", ["plate"]);
        this.plateService.getAll()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((response) => {
                if (response) {
                    this.plates = response;
                }
            });
    }

    public getCandidatePlate(type: string, plate: Plate) {
        if (plate.plate?.length > 0) {
            return <Candidate>plate.plate?.find(item => item.type === type)?.candidate;
        }
    }

    public getPlatesAssociate(): void {
        this.plateService.clearParameter()
        this.plateService.addParameter("voting", this.object.id);
        this.plateService.addParameter("expand", ["plate"]);
        this.plateService.getAll()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((response) => {
                if (response) {
                    this.plate_added = response;
                }
            })
    }

    public drop(event: CdkDragDrop<Plate[]>, target: DropListTypes) {
        const votingPlate = new VotingPlate()
        if (event.previousContainer.data[event.previousIndex].was_voted) {
            this.messageService.create(
                "warning",
                `Essa chapa ja tem votos nessa eleicao e nao pode ser removida!`);
        } else if (event.previousContainer !== event.container) {
            transferArrayItem(
                event.previousContainer.data,
                event.container.data,
                event.previousIndex,
                event.currentIndex,
            )

            if (target == DropListTypes.ALL) {
                votingPlate.plate = event.container.data[event.currentIndex].id;
                votingPlate.voting = this.object.id;
                this.deletePlateVote(votingPlate);

            } else if (target == DropListTypes.ADDED) {
                votingPlate.plate = event.container.data[event.currentIndex].url;
                votingPlate.voting = this.object.url;
                this.associatePlate(votingPlate);
            }
        }
    }


    public deletePlateVote(votingPlate: VotingPlate) {
        this.votingPlateService.clearParameter()
        this.votingPlateService.deleteFromListRoute('delete_voting_plate', votingPlate)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe()
    }

    public associatePlate(votingPlate: VotingPlate) {
        this.votingPlateService.clearParameter()
        this.votingPlateService.save(votingPlate)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe()
    }

    public message(type: string): void {
        if (type === 'success') {
            this.messageService.create(type, `Votação criada com sucesso!`);
        } else {
            this.messageService.create(type, `Favor preencher o campo.`);
        }
    }

    public savePlate(isClose = false) {
        if (!this.object.id) {
            super.saveOrUpdate(() => {
                this.getPlates();
                this.hide = false;
                this.messageService.create(
                    'success',
                    `Votacao criada, associe o presidente e o vice-presidente`
                );
                if (isClose) this.modalService.closeAll();
                this.data.isVoteActive = false;
            });
        } else {
            super.saveOrUpdate(() => {
                this.messageService.create(
                    'success',
                    `A Votacao foi atualizada com sucesso!`
                );
                if (isClose) this.modalService.closeAll();
                this.data.isVoteActive = false;
            });
        }
    }

    public showConfirmMessageSavePlate(isClose = false): void {
        if (this.data.isVoteActive && !this.data.user) {
            this.modalService.confirm({
                nzTitle: 'Votação salva com sucesso, caso esteja criando uma nova votação a antiga sera desativada',
                nzOkText: 'Sim',
                nzOkType: 'primary',
                nzOkDanger: true,
                nzOnOk: () => this.savePlate(isClose),
                nzCancelText: 'Não',
                nzAfterClose: this.modalClosedEmitter
            });
        } else {
            this.savePlate(isClose);
        }
    }

    public close(): void {
        this.modalService.closeAll()
    }

}
