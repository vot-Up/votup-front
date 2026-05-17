import { Component, ChangeDetectionStrategy, OnInit, inject, signal } from '@angular/core';
import { NZ_MODAL_DATA, NzModalService, NzModalFooterDirective } from "ng-zorro-antd/modal";
import {BaseComponent} from "../../../../base.component";
import {URLS} from "../../../../../app/app.urls";
import {takeUntil} from "rxjs";
import {Utils} from "../../../../../../utilities/utils";
import { NzListComponent, NzListItemComponent } from 'ng-zorro-antd/list';
import { NzColDirective } from 'ng-zorro-antd/grid';
import { NzFormControlComponent } from 'ng-zorro-antd/form';
import { NzSpaceCompactItemDirective } from 'ng-zorro-antd/space';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzWaveDirective } from 'ng-zorro-antd/core/wave';
import { ɵNzTransitionPatchDirective } from 'ng-zorro-antd/core/transition-patch';
import { NzIconDirective } from 'ng-zorro-antd/icon';

interface RankingVoter {
    name: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-ranking-item',
    templateUrl: './ranking-item.component.html',
    styleUrls: ['./ranking-item.component.less'],
    imports: [NzListComponent, NzListItemComponent, NzModalFooterDirective, NzColDirective, NzFormControlComponent, NzSpaceCompactItemDirective, NzButtonComponent, NzWaveDirective, ɵNzTransitionPatchDirective, NzIconDirective]
})
export class RankingItemComponent extends BaseComponent<RankingVoter> implements OnInit {
    modal = inject(NzModalService);
    data = inject(NZ_MODAL_DATA);

    public list_user = signal<RankingVoter[]>([])

    constructor() {

        super({pk: "id", endpoint: URLS.VOTING_USER, retrieveOnInit: true})
    
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
            this.list_user.set(response['data'])
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
