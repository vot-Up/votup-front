import {Component, EventEmitter, Injector, OnInit} from '@angular/core';
import {URLS} from "../../../app/app.urls";
import {takeUntil} from "rxjs";
import {BaseComponent} from "../../base.component";
import {Plate} from "../../../../models/core/plate";
import {NzModalService} from "ng-zorro-antd/modal";
import {PlateItemComponent} from "./plate-item/plate-item.component";


@Component({
  standalone: false,
    selector: 'app-plate',
    templateUrl: "./plate.component.html",
    styleUrls: ['./plate.component.less']
})
export class PlateComponent extends BaseComponent<Plate> implements OnInit {

    public items: Plate[] = [];
    public modalClosedEmitter: EventEmitter<void> = new EventEmitter<void>();

    constructor(public injector: Injector,
                private modalService: NzModalService,
    ) {
        super(injector, {endpoint: URLS.PLATE, searchOnInit: true});
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
