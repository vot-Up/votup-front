import {Component, EventEmitter, Injector, Input} from '@angular/core';
import {NzModalService} from "ng-zorro-antd/modal";
import {BaseComponent} from "../../base.component";
import {URLS} from "../../../app/app.urls";
import {takeUntil} from "rxjs";
import {AuthService} from "../../../../services/auth.service";
import {Voter} from "../../../../models/core/voter";
import {VoterItemComponent} from "./voter-item/voter-item.component";

@Component({
    selector: 'app-voter',
    templateUrl: './voter.component.html',
    styleUrls: ['./voter.component.less']
})
export class VoterComponent extends BaseComponent<Voter> {
    @Input() voter: Voter

    public object: Voter = new Voter();
    public tableData: Voter[] = [];
    public modalClosedEmitter: EventEmitter<void> = new EventEmitter<void>();
    public voterLogged: Voter;
    public isUpdate: boolean = false;


    constructor(public injector: Injector,
                private modalService: NzModalService,
                public authService: AuthService,) {
        super(injector, {endpoint: URLS.VOTE, retrieveOnInit: true, searchOnInit: true});
    }

    ngOnInit(): void {
        super.ngOnInit(() => this.voter = this.authService.user);
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
    }

    public openModal(): void {
        const modal = this.modalService.create({
            nzWidth: '40%',
            nzCentered: true,
            nzTitle: 'Cadastrar eleitor',
            nzContent: VoterItemComponent
        })
        modal.afterClose.subscribe(() => {
            this.search();
        })
    }

    public editElector(voter: Voter): void {
        const modal = this.modalService.create({
            nzWidth: '40%',
            nzCentered: true,
            nzTitle: 'Editar dados do eleitor',
            nzContent: VoterItemComponent,
            nzAfterClose: this.modalClosedEmitter,
            nzData: {
                pk: voter.id,
                voter: voter,
                isUpdate: this.isUpdate = true
            }
        });
        modal.afterClose.subscribe(() => {
            this.search();
        })


    }


    public excludeElector(value): void {
        this.modalService.confirm({
            nzTitle: "Tem certeza de que deseja excluir esse eleitor?",
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
