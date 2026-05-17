import { Component, EventEmitter, Injector, OnInit, inject } from '@angular/core';
import {URLS} from "../../../app/app.urls";
import {takeUntil} from "rxjs";
import {BaseComponent} from "../../base.component";
import {Plate} from "../../../../models/core/plate";
import {NzModalService} from "ng-zorro-antd/modal";
import {PlateItemComponent} from "./plate-item/plate-item.component";
import { NzRowDirective, NzColDirective } from 'ng-zorro-antd/grid';
import { NzSpaceCompactItemDirective, NzSpaceComponent, NzSpaceItemDirective } from 'ng-zorro-antd/space';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzWaveDirective } from 'ng-zorro-antd/core/wave';
import { ɵNzTransitionPatchDirective } from 'ng-zorro-antd/core/transition-patch';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzFormDirective, NzFormItemComponent } from 'ng-zorro-antd/form';
import { NzInputDirective, NzInputGroupComponent } from 'ng-zorro-antd/input';
import { NzSelectComponent, NzOptionComponent } from 'ng-zorro-antd/select';
import { NzTableComponent, NzTheadComponent, NzTrDirective, NzTableCellDirective, NzThMeasureDirective, NzTbodyComponent } from 'ng-zorro-antd/table';
import { NzSwitchComponent } from 'ng-zorro-antd/switch';
import { NzTooltipDirective } from 'ng-zorro-antd/tooltip';
import { NzPaginationComponent } from 'ng-zorro-antd/pagination';


@Component({
    selector: 'app-plate',
    templateUrl: "./plate.component.html",
    styleUrls: ['./plate.component.less'],
    imports: [NzRowDirective, NzSpaceCompactItemDirective, NzButtonComponent, NzWaveDirective, ɵNzTransitionPatchDirective, NzIconDirective, FormsModule, NzFormDirective, ReactiveFormsModule, NzColDirective, NzFormItemComponent, NzInputDirective, NzInputGroupComponent, NzSelectComponent, NzOptionComponent, NzTableComponent, NzTheadComponent, NzTrDirective, NzTableCellDirective, NzThMeasureDirective, NzTbodyComponent, NzSwitchComponent, NzSpaceComponent, NzSpaceItemDirective, NzTooltipDirective, NzPaginationComponent]
})
export class PlateComponent extends BaseComponent<Plate> implements OnInit {
    injector: Injector;
    private modalService = inject(NzModalService);


    public items: Plate[] = [];
    public modalClosedEmitter: EventEmitter<void> = new EventEmitter<void>();

    constructor() {
        const injector = inject(Injector);

        super(injector, {endpoint: URLS.PLATE, searchOnInit: true});
    
        this.injector = injector;
    }


    public createFormGroup(): void {
        this.formGroup = this.formBuilder.group({
            name: [null],
            status: [null]
        })
    }

    public search(): void {
        this.service.clearParameter();
        if (this.v.name) {
            this.service.addParameter('name', this.v.name);
        }
        if (this.v.status) {
            this.service.addParameter('active', this.v.status);
        }
        // this.service.addParameter('ordering', 'created_at');
        super.search()
    }

    public delete(value): void {
        this.service.clearParameter();
        this.service.delete(value.id).pipe(
            takeUntil(this.unsubscribe)
        ).subscribe(() => {
            this.search()
        });
    }

    showConfirmMessage(value): void {
        const modal = this.modalService.confirm({
            nzTitle: 'Tem certeza de que quer excluir essa chapa?',
            nzOkText: 'Sim',
            nzOkType: 'primary',
            nzOkDanger: true,
            nzOnOk: () => this.delete(value),
            nzCancelText: 'Não',
            nzAfterClose: this.modalClosedEmitter
        });
        modal.afterClose.subscribe(() => {
            this.search();
        });
    }

    showModal(): void {
        const modal = this.modalService.create({
            nzWidth: '80%',
            nzCentered: true,
            nzTitle: 'Criar chapa',
            nzContent: PlateItemComponent,
        });
        modal.afterClose.subscribe(() => {
            this.search();
        });
    }

    showEditModal(plate: Plate): void {
        const modal = this.modalService.create({
            nzWidth: '80%',
            nzCentered: true,
            nzTitle: 'Editar chapa',
            nzContent: PlateItemComponent,
            nzAfterClose: this.modalClosedEmitter,
            nzData: {
                pk: plate.id,
                plate: plate,
            }
        });
        modal.afterClose.subscribe(() => {
            this.search();
        });
    }

}
