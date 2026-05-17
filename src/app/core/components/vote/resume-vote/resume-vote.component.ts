import { Component, Injector, OnInit, inject } from '@angular/core';
import {BaseComponent} from "../../../base.component";
import { NZ_MODAL_DATA, NzModalService, NzModalFooterDirective } from "ng-zorro-antd/modal";
import {URLS} from "../../../../app/app.urls";
import {takeUntil} from "rxjs";
import {CustomValidators} from "../../../../../utilities/validator/custom-validators";
import {ResumeVoting} from "../../../../../models/core/resume-voting";
import {VotingPlate} from "../../../../../models/core/voting-plate";
import {BaseService} from "../../../../../services/base.service";
import {Plate} from "../../../../../models/core/plate";
import {Voting} from "../../../../../models/core/voting";
import {NzMessageService} from "ng-zorro-antd/message";
import {Utils} from "../../../../../utilities/utils";
import { NzTableComponent, NzTheadComponent, NzTrDirective, NzTableCellDirective, NzThMeasureDirective, NzTbodyComponent } from 'ng-zorro-antd/table';
import { NzSpaceCompactItemDirective } from 'ng-zorro-antd/space';
import { NzInputDirective } from 'ng-zorro-antd/input';
import { FormsModule } from '@angular/forms';
import { NzColDirective } from 'ng-zorro-antd/grid';
import { NzFormControlComponent } from 'ng-zorro-antd/form';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzWaveDirective } from 'ng-zorro-antd/core/wave';
import { ɵNzTransitionPatchDirective } from 'ng-zorro-antd/core/transition-patch';
import { NzIconDirective } from 'ng-zorro-antd/icon';


interface DialogData {
    voting: Voting;
}

@Component({
    selector: 'app-resume-vote',
    templateUrl: './resume-vote.component.html',
    styleUrls: ['./resume-vote.component.less'],
    imports: [NzTableComponent, NzTheadComponent, NzTrDirective, NzTableCellDirective, NzThMeasureDirective, NzTbodyComponent, NzSpaceCompactItemDirective, NzInputDirective, FormsModule, NzModalFooterDirective, NzColDirective, NzFormControlComponent, NzButtonComponent, NzWaveDirective, ɵNzTransitionPatchDirective, NzIconDirective]
})
export class ResumeVoteComponent extends BaseComponent<ResumeVoting> implements OnInit {
    injector: Injector;
    messageService = inject(NzMessageService);
    modal = inject(NzModalService);
    data = inject<DialogData>(NZ_MODAL_DATA);

    public votingPlateList: VotingPlate[] = [];
    public serviceVotingPlate: BaseService<VotingPlate>;
    public currentDateTime: string = ''
    constructor() {
        const injector = inject(Injector);

        super(injector, {endpoint: URLS.RESUME_VOTE, searchOnInit: true});
        this.injector = injector;

        this.serviceVotingPlate = this.createService(VotingPlate, URLS.VOTING_PLATE);
    }

    public createFormGroup(): void {
        this.formGroup = this.formBuilder.group({
            plate: [null, CustomValidators.required],
            voting: [null, CustomValidators.required],
            quantity: [null],
        });
    }

    public getVotingPlate(): void {
        this.serviceVotingPlate.clearParameter();
        this.serviceVotingPlate.addParameter('voting', this.data.voting.id);
        this.serviceVotingPlate.addParameter("expand", ["plate"]);
        this.serviceVotingPlate.getAll()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((response: ResumeVoting[]) => {
                this.votingPlateList = response;
                this.fillResumeVoteCreate();
            });
    }

    private fillResumeVoteCreate() {
        const listResumeVoting: ResumeVoting[] = [];
        this.votingPlateList.forEach(item => {
            const resumeVoting = new ResumeVoting()
            resumeVoting.voting = this.data.voting;
            resumeVoting.plate = item.plate;
            resumeVoting.quantity = 0;
            listResumeVoting.push(resumeVoting);
        });
        this.tableData = listResumeVoting;
    }

    public search(): void {
        this.service.clearParameter();
        this.service.addParameter('voting', this.data.voting.id);
        this.service.addParameter("expand", ["plate", "voting"]);
        super.search(() => {
            if (this.tableData.length == 0) {
                this.getVotingPlate();
            }
        });
    }


    public saveResumeVote() {
        this.service.clearParameter();
        this.tableData.forEach(item => {
            const payload: ResumeVoting = item;
            payload.plate = (<Plate>payload.plate).url
            payload.voting = (<Voting>payload.voting).url

            if (payload.id == undefined) {
                this.service.save(payload)
                    .pipe(takeUntil(this.unsubscribe))
                    .subscribe(() => {
                        this.messageService.create('success', 'Salvo com sucesso');


                    });
            } else {
                this.service.update(payload.id, payload)
                    .pipe(takeUntil(this.unsubscribe))
                    .subscribe(() => {
                        this.messageService.create('success', 'Salvo com sucesso');
                    });
            }
        })
        this.cancel();
    }


    generateReportVoterResumePlate() {
        const now = new Date();
        this.currentDateTime = now.toLocaleString();
        const payload = {};
        payload["event_vote"] = this.data.voting.id;
        this.service.loadFile("resume_report", payload)
            .subscribe(response => {
                Utils.downloadFileFromBlob(response, `${this.data.voting.description}-${this.currentDateTime}.pdf`);
            });
    }


    public cancel() {
        this.modal.closeAll()
    }

}
