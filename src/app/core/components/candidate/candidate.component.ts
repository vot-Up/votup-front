import { Component, EventEmitter, OnInit, inject, input } from '@angular/core';
import {NzModalService} from "ng-zorro-antd/modal";
import {BaseComponent} from "../../base.component";
import {URLS} from "../../../app/app.urls";
import {takeUntil} from "rxjs";
import {Candidate} from "../../../../models/core/candidate";
import {AuthService} from "../../../../services/auth.service";
import {CandidateItemComponent} from "./candidate-item/candidate-item.component";
import {User} from "../../../../models/core/user";
import { NzRowDirective, NzColDirective } from 'ng-zorro-antd/grid';
import { NzSpaceCompactItemDirective, NzSpaceComponent, NzSpaceItemDirective } from 'ng-zorro-antd/space';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzWaveDirective } from 'ng-zorro-antd/core/wave';
import { ɵNzTransitionPatchDirective } from 'ng-zorro-antd/core/transition-patch';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzFormDirective, NzFormItemComponent } from 'ng-zorro-antd/form';
import { NzInputDirective } from 'ng-zorro-antd/input';
import { NzSelectComponent, NzOptionComponent } from 'ng-zorro-antd/select';
import { NzTableComponent, NzTheadComponent, NzTrDirective, NzTableCellDirective, NzThMeasureDirective, NzTbodyComponent } from 'ng-zorro-antd/table';
import { NzSwitchComponent } from 'ng-zorro-antd/switch';
import { NzTooltipDirective } from 'ng-zorro-antd/tooltip';
import { NzPaginationComponent } from 'ng-zorro-antd/pagination';
import { PhonePipe } from '../../../shared/phone-pipe/phone.pipe';

@Component({
    selector: 'app-candidate',
    templateUrl: './candidate.component.html',
    styleUrls: ['./candidate.component.less'],
    imports: [NzRowDirective, NzSpaceCompactItemDirective, NzButtonComponent, NzWaveDirective, ɵNzTransitionPatchDirective, NzIconDirective, FormsModule, NzFormDirective, ReactiveFormsModule, NzColDirective, NzFormItemComponent, NzInputDirective, NzSelectComponent, NzOptionComponent, NzTableComponent, NzTheadComponent, NzTrDirective, NzTableCellDirective, NzThMeasureDirective, NzTbodyComponent, NzSwitchComponent, NzSpaceComponent, NzSpaceItemDirective, NzTooltipDirective, NzPaginationComponent, PhonePipe]
})
export class CandidateComponent extends BaseComponent<Candidate> implements OnInit {
    private modalService = inject(NzModalService);
    authService = inject(AuthService);

    readonly candidate = input<Candidate>(undefined);

    public modalClosedEmitter: EventEmitter<void> = new EventEmitter<void>();
    public candidateLogged: User;
    public candidateAssociate: boolean = false
    public isUpdate: boolean = false;


    constructor() {

        super({endpoint: URLS.CANDIDATE, retrieveOnInit: true, searchOnInit: true});
    
    }

    public ngOnInit(): void {
        super.ngOnInit(() => this.candidateLogged = this.authService.user);
    }


    public createFormGroup(): void {
        this.formGroup = this.formBuilder.group({
            user: [null],
            active: [null],
            name: [null],
        })
    }

    public search(): void {
        this.service.clearParameter();
        if (this.v.name) {
            this.service.addParameter("name", this.v.name);
        }
        if (this.v.active) {
            this.service.addParameter("active", this.v.active)
        }
        super.search();
        // this.getCandidateAssociate()
    }

    public openModal(): void {
        const modal = this.modalService.create({
            nzWidth: '40%',
            nzCentered: true,
            nzTitle: 'Cadastrar candidato',
            nzContent: CandidateItemComponent
        })
        modal.afterClose.subscribe(() => {
            this.search();
        })
    }

    public editCandidate(candidate: Candidate): void {
        const modal = this.modalService.create({
            nzWidth: '40%',
            nzCentered: true,
            nzTitle: 'Editar dados do candidato',
            nzContent: CandidateItemComponent,
            nzAfterClose: this.modalClosedEmitter,
            nzData: {
                pk: candidate.id,
                candidate: candidate,
                isUpdate: this.isUpdate = true
            }
        });
        modal.afterClose.subscribe(() => {
            this.search();
        })
    }


    public excludeCandidate(value): void {
        this.modalService.confirm({
            nzTitle: "Tem certeza de que deseja excluir esse candidato?",
            nzOkText: 'Sim',
            nzOkType: 'primary',
            nzOkDanger: true,
            nzOnOk: () => this.delete(value),
            nzCancelText: 'Não',
            nzAfterClose: this.modalClosedEmitter,
        });
        this.modalClosedEmitter.subscribe(() => {
            this.search();
        })
    }

    public getCandidateAssociate() {
        this.service.clearParameter();
        this.service.getFromListRoute('get_candidate_associate')
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => {
            });

    }

    delete(value): void {
        this.service.clearParameter();
        this.service.delete(value.id)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => {
                this.search()
            });
    }


    public changePaginator(event: any): void {
    }
}
