import {Component, EventEmitter, Inject, Injector, OnInit} from '@angular/core';
import {BaseComponent} from "../../../base.component";
import {NZ_MODAL_DATA, NzModalService} from "ng-zorro-antd/modal";
import {URLS} from "../../../../app/app.urls";
import {Observable, of, takeUntil} from "rxjs";
import {Utils} from "../../../../../utilities/utils";
import {RankingItemComponent} from "./ranking-item/ranking-item.component";

interface Ranking {
    plate__id: number,
    total: number;
    plate__name: string;

}

@Component({
    selector: 'app-ranking',
    templateUrl: './ranking.component.html',
    styleUrls: ['./ranking.component.less']
})
export class RankingComponent extends BaseComponent<null> implements OnInit {

    public ranking: Ranking[] = [];
    public modalClosedEmitter: EventEmitter<void> = new EventEmitter<void>();

    constructor(public injector: Injector,
                public modal: NzModalService,
                private modalService: NzModalService,
                @Inject(NZ_MODAL_DATA) public data: any
    ) {
        super(injector, {endpoint: URLS.VOTING_USER, searchOnInit: true});
    }

    ngOnInit() {
        super.ngOnInit(() => {
            this.getRanking();
        });

    }

    createFormGroup(): void {
    }


    public beforeRetrieve(): Observable<number | string> {
        return of(this.data.pk);
    }

    public getRanking(): void {
        this.service.clearParameter()
        this.service.getFromDetailRoute(this.data.pk, "ranking").pipe(takeUntil(this.unsubscribe))
            .subscribe((response: Ranking[]) => {
                this.ranking = response;
            })
    }

    public getPlateWithMostVotes(): string {
        let maxVotes = -1;
        let plateWithMostVotes = '';
        for (const item of this.ranking) {
            if (item.total > maxVotes) {
                maxVotes = item.total;
                plateWithMostVotes = item.plate__name;
            }
        }
        return plateWithMostVotes;
    }


    public openModal(plate): void {
        const modal = this.modalService.create({
            nzWidth: '30%',
            nzCentered: true,
            nzTitle: 'Usuarios que votaram',
            nzContent: RankingItemComponent,
            nzAfterClose: this.modalClosedEmitter,
            nzData: {
                pk: plate.plate__id,
                plate: plate,
                event_vote: this.data.pk
            }
        })
        modal.afterClose.subscribe(() => {
            this.search();
        })
    }

    public cancel(): void {
        this.modal.closeAll();
    }

    generateReportVoterPlate() {
        const payload = {};
        payload["event_vote"] = this.data.pk;
        this.service.loadFile("resume_report", payload)
            .subscribe(response => {
                Utils.downloadFileFromBlob(response, "total_votos_por_chapa.pdf");
            });
    }
}
