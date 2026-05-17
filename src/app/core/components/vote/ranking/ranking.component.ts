import { Component, ChangeDetectionStrategy, computed, EventEmitter, OnInit, inject, signal } from '@angular/core';
import {BaseComponent} from "../../../base.component";
import { NZ_MODAL_DATA, NzModalService, NzModalFooterDirective } from "ng-zorro-antd/modal";
import {URLS} from "../../../../app/app.urls";
import {Observable, of, takeUntil} from "rxjs";
import {Utils} from "../../../../../utilities/utils";
import {RankingItemComponent} from "./ranking-item/ranking-item.component";
import { NzTableComponent, NzTheadComponent, NzTrDirective, NzTableCellDirective, NzThMeasureDirective, NzTbodyComponent } from 'ng-zorro-antd/table';
import { NzSpaceCompactItemDirective } from 'ng-zorro-antd/space';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzWaveDirective } from 'ng-zorro-antd/core/wave';
import { ɵNzTransitionPatchDirective } from 'ng-zorro-antd/core/transition-patch';
import { NzTooltipDirective } from 'ng-zorro-antd/tooltip';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzColDirective } from 'ng-zorro-antd/grid';
import { NzFormControlComponent } from 'ng-zorro-antd/form';

export interface Ranking {
    plate__id: number,
    total: number;
    plate__name: string;

}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-ranking',
    templateUrl: './ranking.component.html',
    styleUrls: ['./ranking.component.less'],
    imports: [NzTableComponent, NzTheadComponent, NzTrDirective, NzTableCellDirective, NzThMeasureDirective, NzTbodyComponent, NzSpaceCompactItemDirective, NzButtonComponent, NzWaveDirective, ɵNzTransitionPatchDirective, NzTooltipDirective, NzIconDirective, NzModalFooterDirective, NzColDirective, NzFormControlComponent]
})
export class RankingComponent extends BaseComponent<null> implements OnInit {
    modal = inject(NzModalService);
    private modalService = inject(NzModalService);
    data = inject(NZ_MODAL_DATA);


    public ranking = signal<Ranking[]>([]);
    public plateWithMostVotes = computed(() => {
        let maxVotes = -1;
        let plateWithMostVotes = '';
        for (const item of this.ranking()) {
            if (item.total > maxVotes) {
                maxVotes = item.total;
                plateWithMostVotes = item.plate__name;
            }
        }
        return plateWithMostVotes;
    });
    public modalClosedEmitter: EventEmitter<void> = new EventEmitter<void>();

    constructor() {

        super({endpoint: URLS.VOTING_USER, searchOnInit: true});
    
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
                this.ranking.set(response);
            })
    }

    public openModal(plate: Ranking): void {
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
