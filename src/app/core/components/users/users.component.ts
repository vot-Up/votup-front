import { Component, ChangeDetectionStrategy, computed, EventEmitter, OnInit, inject, input, output, signal } from '@angular/core';
import {User} from "../../../../models/core/user";
import {URLS} from "../../../app/app.urls";
import {BaseComponent} from "../../base.component";
import {takeUntil} from "rxjs";
import {UsersItemComponent} from "./users-item/users-item.component";
import {AuthService} from "../../../../services/auth.service";
import {ResponsiveModalService} from "../../../../services/responsive-modal.service";
import { NzRowDirective, NzColDirective } from 'ng-zorro-antd/grid';
import { NzSpaceCompactItemDirective } from 'ng-zorro-antd/space';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzWaveDirective } from 'ng-zorro-antd/core/wave';
import { ɵNzTransitionPatchDirective } from 'ng-zorro-antd/core/transition-patch';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzFormDirective, NzFormItemComponent } from 'ng-zorro-antd/form';
import { NzInputDirective } from 'ng-zorro-antd/input';
import { NzSelectComponent, NzOptionComponent } from 'ng-zorro-antd/select';
import { NzPaginationComponent } from 'ng-zorro-antd/pagination';
import { NzListComponent, NzListItemComponent } from 'ng-zorro-antd/list';
import { PhonePipe } from '../../../shared/phone-pipe/phone.pipe';


@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-voters',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.less'],
    imports: [NzRowDirective, NzSpaceCompactItemDirective, NzButtonComponent, NzWaveDirective, ɵNzTransitionPatchDirective, NzIconDirective, FormsModule, NzFormDirective, ReactiveFormsModule, NzColDirective, NzFormItemComponent, NzInputDirective, NzSelectComponent, NzOptionComponent, NzPaginationComponent, NzListComponent, NzListItemComponent, PhonePipe]
})
export class UsersComponent extends BaseComponent<User> implements OnInit {
    private responsiveModal = inject(ResponsiveModalService);
    authService = inject(AuthService);


    readonly user = input<User>(undefined);
    readonly valueEmitter = output<boolean>();

    public items = signal<User[]>([]);
    public modalClosedEmitter: EventEmitter<void> = new EventEmitter<void>();
    public userLogged = signal<User | null>(null);
    public isUpdate = signal(false);
    public isLogged = signal(false);
    public superUserView = signal(false);
    public expandedIds = signal<Set<number>>(new Set());
    public userLoggedActive = computed(() => (user: User) => this.authService.user.email === user.email);


    constructor() {

        super({endpoint: URLS.USER, retrieveOnInit: true, searchOnInit: true});
    
    }

    ngOnInit(): void {
        super.ngOnInit(() => this.userLogged.set(this.authService.user));
        this.superUserView.set(this.authService.user.is_superuser);
    }

    public toggleExpand(id: number): void {
        this.expandedIds.update(ids => {
            const next = new Set(ids);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }

    public createFormGroup(): void {
        this.formGroup = this.formBuilder.group({
            user: [null],
            is_active: [null],
            name: [null],
        })
    }

    public search(): void {
        this.service.clearParameter();
        if (this.v.name) {
            this.service.addParameter("name", this.v.name);
        }
        if (this.v.is_active) {
            this.service.addParameter("is_active", this.v.is_active)
        }
        super.search();
    }

    public openModal(): void {
        const modal = this.responsiveModal.create({
            nzTitle: 'Cadastrar usuário',
            nzContent: UsersItemComponent
        });
        modal.afterClose.subscribe(() => {
            this.search();
        });
    }

    public editUser(user: User): void {
        const modal = this.responsiveModal.create({
            nzTitle: 'Editar dados do usuário',
            nzContent: UsersItemComponent,
            nzAfterClose: this.modalClosedEmitter,
            nzData: {
                pk: user.id,
                user: user,
                isUpdate: this.isUpdate.set(true)
            }
        });
        modal.afterClose.subscribe(() => {
            this.search();
        });
    }

    public excludeUser(value): void {
        this.responsiveModal.createConfirm({
            nzTitle: "Tem certeza de que deseja excluir esse usuario?",
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
        this.service.delete(value.id).pipe(takeUntil(this.unsubscribe)).subscribe(() => {
            this.search()
        });
    }


}
