import {Component, Inject, Injector, OnInit} from '@angular/core';
import {NZ_MODAL_DATA, NzModalService} from "ng-zorro-antd/modal";
import {BaseComponent} from "../../../../base.component";
import {URLS} from "../../../../../app/app.urls";
import {takeUntil} from "rxjs";
import {Utils} from "../../../../../../utilities/utils";

class Ranking {
}

@Component({
    selector: 'app-ranking-item',
    templateUrl: './ranking-item.component.html',
    styleUrls: ['./ranking-item.component.less']
})
export class RankingItemComponent extends BaseComponent<Ranking> implements OnInit {
    public list_user: any = []

    constructor(public injector: Injector,
                public modal: NzModalService,
                @Inject(NZ_MODAL_DATA) public data: any) {
        super(injector, {pk: "id", endpoint: URLS.VOTING_USER, retrieveOnInit: true})
    }

    ngOnInit(): void {
        this.createFormGroup();
        this.getVoterPlate()
    }

    createFormGroup(): void {
    }

    public getVoterPlate() {
        this.service.clearParameter()

        this.service.addParameter('plate', this.data.pk)
        this.service.getFromListRoute('get_voter_plate').pipe(
            takeUntil(this.unsubscribe)
        ).subscribe(response => {
            this.list_user = response['data']
        });
    }

    public generateReportVoterPlate() {
        const payload = {};
        payload["plate"] = this.data.pk;
        payload["event_vote"] = this.data.event_vote;
        this.service.loadFile("resume_report_plate_vote", payload)
            .subscribe(response => {
                Utils.downloadFileFromBlob(response, "votantes_por_chapa.pdf");
            });
    }

    public cancel(): void {
        this.modal.closeAll();
    }
}
