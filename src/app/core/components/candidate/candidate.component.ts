import {Component, EventEmitter, Injector, Input, OnInit} from '@angular/core';
import {NzModalService} from "ng-zorro-antd/modal";
import {BaseComponent} from "../../base.component";
import {URLS} from "../../../app/app.urls";
import {takeUntil} from "rxjs";
import {Candidate} from "../../../../models/core/candidate";
import {AuthService} from "../../../../services/auth.service";
import {CandidateItemComponent} from "./candidate-item/candidate-item.component";
import {User} from "../../../../models/core/user";

@Component({
    selector: 'app-candidate',
    templateUrl: './candidate.component.html',
    styleUrls: ['./candidate.component.less']
})
export class CandidateComponent extends BaseComponent<Candidate> implements OnInit {
    @Input() candidate: Candidate

    public object: Candidate = new Candidate();
    public tableData: Candidate[] = [];
    public modalClosedEmitter: EventEmitter<void> = new EventEmitter<void>();
    public candidateLogged: User;
    public candidateAssociate: boolean = false
    public isUpdate: boolean = false;


    constructor(public injector: Injector,
                private modalService: NzModalService,
                public authService: AuthService,) {
        super(injector, {endpoint: URLS.CANDIDATE, retrieveOnInit: true, searchOnInit: true});
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
