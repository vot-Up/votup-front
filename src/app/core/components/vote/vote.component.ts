import { Component, ChangeDetectionStrategy, EventEmitter, OnInit, inject, signal } from '@angular/core';
import {VoteItemComponent} from "./vote-item/vote-item.component";
import {NzModalService} from "ng-zorro-antd/modal";
import {Voting} from "../../../../models/core/voting";
import {BaseComponent} from "../../base.component";
import {URLS} from "../../../app/app.urls";
import {takeUntil} from "rxjs";
import {DatePipe} from "@angular/common";
import {RankingComponent} from "./ranking/ranking.component";
import {NzMessageService} from "ng-zorro-antd/message";
import {Utils} from "../../../../utilities/utils";
import {ResumeVoteComponent} from "./resume-vote/resume-vote.component";
import {BaseService} from "../../../../services/base.service";
import {Plate} from "../../../../models/core/plate";
import {AuthService} from "../../../../services/auth.service";
import { NzRowDirective, NzColDirective } from 'ng-zorro-antd/grid';
import { NzSpaceCompactItemDirective } from 'ng-zorro-antd/space';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzWaveDirective } from 'ng-zorro-antd/core/wave';
import { ɵNzTransitionPatchDirective } from 'ng-zorro-antd/core/transition-patch';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzFormDirective, NzFormItemComponent } from 'ng-zorro-antd/form';
import { NzInputDirective } from 'ng-zorro-antd/input';
import { NzDatePickerComponent } from 'ng-zorro-antd/date-picker';
import { NzSelectComponent, NzOptionComponent } from 'ng-zorro-antd/select';
import { NzTableComponent, NzTheadComponent, NzTrDirective, NzTableCellDirective, NzThMeasureDirective, NzTbodyComponent } from 'ng-zorro-antd/table';
import { NzSwitchComponent } from 'ng-zorro-antd/switch';
import { NzPaginationComponent } from 'ng-zorro-antd/pagination';
import { NzListComponent, NzListItemComponent } from 'ng-zorro-antd/list';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-vote',
    templateUrl: './vote.component.html',
    styleUrls: ['./vote.component.less'],
    imports: [NzRowDirective, NzSpaceCompactItemDirective, NzButtonComponent, NzWaveDirective, ɵNzTransitionPatchDirective, NzIconDirective, FormsModule, NzFormDirective, ReactiveFormsModule, NzColDirective, NzFormItemComponent, NzInputDirective, NzDatePickerComponent, NzSelectComponent, NzOptionComponent, NzPaginationComponent, DatePipe, NzListComponent, NzListItemComponent]
})
export class VoteComponent extends BaseComponent<Voting> implements OnInit {
    private modalService = inject(NzModalService);
    private datePipe = inject(DatePipe);
    authService = inject(AuthService);
    toast = inject(NzMessageService);

    public modalClosedEmitter: EventEmitter<void> = new EventEmitter<void>();
    public isVoteActive = signal(false);
    public expandedIds = signal<Set<number>>(new Set());
    public plateService: BaseService<Plate>;
    public hasPermissionValue: boolean

    constructor() {

        super({endpoint: URLS.VOTING, searchOnInit: true});

        this.plateService = this.createService(URLS.PLATE);
    }


    public toggleExpand(id: number): void {
        this.expandedIds.update(ids => {
            const next = new Set(ids);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }

    public createFormGroup(): void {
        this.formGroup = this.formBuilder.group({
            active: [null],
            description: [null],
            start_date: [null],
            final_date: [null]
        })
    }

    public search(): void {
        this.service.clearParameter();
        if (this.v.active) {
            this.service.addParameter("active", this.v.active)
        }
        if (this.v.description) {
            this.service.addParameter("description", this.v.description)
        }
        if (this.v.start_date) {

            const dateObject_start = new Date(this.v.start_date);
            const formattedDate_start = this.datePipe.transform(
                dateObject_start, 'yyyy-MM-dd 00:00:00'
            );

            this.service.addParameter("start_date", formattedDate_start)
        }
        if (this.v.final_date) {
            const dateObject_final = new Date(this.v.final_date);
            const formattedDate_final = this.datePipe.transform(
                dateObject_final, 'yyyy-MM-dd 23:59:59'
            );
            this.service.addParameter("final_date", formattedDate_final)
        }
        super.search(() => {
            this.modalClosedEmitter = new EventEmitter<void>();
            this.isVoteActive.set(this.tableData().find(vote => vote.active === true) != undefined)
        })
    }

    public delete(value): void {
        this.service.clearParameter();
        this.service.delete(value.id)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => {
                this.search();
            });
    }

    public showModal(voting?: Voting): void {
        const data = {isVoteActive: this.isVoteActive()};

        if (voting !== undefined) {
            data['pk'] = voting.id;
            data['voting'] = voting;
        }
        this.modalService.create({
            nzWidth: 760,
            nzCentered: true,
            nzTitle: voting ? 'Editar votação' : 'Criar votação',
            nzContent: VoteItemComponent,
            nzBodyStyle: {'max-height': 'calc(80vh - 110px)', 'overflow-y': 'auto', 'padding': '16px 20px'},
            nzAfterClose: this.modalClosedEmitter,
            nzData: data
        });

        this.modalClosedEmitter
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => {
                this.search();
            });
    }

    public showConfirmMessage(value): void {
        this.modalService.confirm({
            nzTitle: 'Tem certeza de que quer apagar essa votação?',
            nzOkText: 'Sim',
            nzOkType: 'primary',
            nzOkDanger: true,
            nzOnOk: () => this.delete(value),
            nzCancelText: 'Não',
            nzAfterClose: this.modalClosedEmitter
        });
        this.modalClosedEmitter
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => {
                this.search();
            });
    }

    public showCloseVoteMessage(vote): void {
        this.modalService.confirm({
            nzTitle: 'Tem certeza que deseja encerrar essa votação?',
            nzOkText: 'Sim',
            nzCancelText: 'Não',
            nzOkType: 'primary',
            nzOkDanger: true,
            nzOnOk: () => this.closeVote(vote),
            nzAfterClose: this.modalClosedEmitter,
        });
        this.modalClosedEmitter.pipe(takeUntil(this.unsubscribe))
            .subscribe(() => {
                this.search();
            });
    }

    public closeVote(vote: Voting): void {
        const payload = {
            "vote_id": vote.id
        }
        this.service.clearParameter()
        this.service.patchFromListRoute("close_vote", payload)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(response => {
                if (response['message']) {
                    this.toast.create('success', response['message']);
                }
            })
    }

    public activeVote(vote: Voting): void {
        const payload = {
            "vote_id": vote.id
        };
        this.service.clearParameter();
        this.service.patchFromListRoute("active_vote", payload)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(response => {
                if (response['message']) {
                    this.toast.create('success', response['message']);
                }
            })
    }


    public showEditVote(voting) {
        this.modalService.create({
            nzWidth: '80%',
            nzCentered: true,
            nzTitle: 'Resultado',
            nzContent: ResumeVoteComponent,
            nzAfterClose: this.modalClosedEmitter,
            nzData: {voting: voting}
        });
        this.modalClosedEmitter
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => {
                this.search();
            });
    }

    public showRanking(votingId): void {
        this.modalService.create({
            nzWidth: '80%',
            nzCentered: true,
            nzTitle: 'Resultado',
            nzContent: RankingComponent,
            nzAfterClose: this.modalClosedEmitter,
            nzData: {pk: votingId.id}
        });
        this.modalClosedEmitter
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => {
                this.search();
            });
    }

    public activeVoteModal(vote: Voting) {
        this.modalService.confirm({
            nzTitle: 'Tem certeza que reativar essa votaçao?',
            nzOkText: 'Sim',
            nzCancelText: 'Não',
            nzOkType: 'primary',
            nzOkDanger: true,
            nzOnOk: () => this.activeVote(vote),
            nzAfterClose: this.modalClosedEmitter,
        });
        this.modalClosedEmitter
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => {
                this.search();
            });
    }

    public generateReportResume(id_resume_vote: number): void {
        const payload = {};
        payload["resume_vote"] = id_resume_vote;
        this.service.loadFile("resume_report", payload)
            .subscribe(response => {
                Utils.downloadFileFromBlob(response, "resume.pdf");
            });
    }


}
