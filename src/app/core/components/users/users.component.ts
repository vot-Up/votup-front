import { Component, EventEmitter, Injector, Input, OnInit, Output, inject } from '@angular/core';
import {User} from "../../../../models/core/user";
import {URLS} from "../../../app/app.urls";
import {BaseComponent} from "../../base.component";
import {takeUntil} from "rxjs";
import {NzModalService} from "ng-zorro-antd/modal";
import {UsersItemComponent} from "./users-item/users-item.component";
import {UserService} from "../../../../services/user.service";
import {AuthService} from "../../../../services/auth.service";
import { NzRowDirective, NzColDirective } from 'ng-zorro-antd/grid';
import { NzSpaceCompactItemDirective, NzSpaceComponent, NzSpaceItemDirective } from 'ng-zorro-antd/space';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzWaveDirective } from 'ng-zorro-antd/core/wave';
import { ɵNzTransitionPatchDirective } from 'ng-zorro-antd/core/transition-patch';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzFormDirective, NzFormItemComponent } from 'ng-zorro-antd/form';
import { NzInputDirective } from 'ng-zorro-antd/input';
import { NzSelectComponent, NzOptionComponent } from 'ng-zorro-antd/select';
import { NzTableComponent, NzTheadComponent, NzTrDirective, NzTableCellDirective, NzThMeasureDirective, NzTbodyComponent } from 'ng-zorro-antd/table';
import { NzSwitchComponent } from 'ng-zorro-antd/switch';
import { NzTooltipDirective } from 'ng-zorro-antd/tooltip';
import { NzPaginationComponent } from 'ng-zorro-antd/pagination';
import { PhonePipe } from '../../../shared/phone-pipe/phone.pipe';


@Component({
    selector: 'app-voters',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.less'],
    imports: [NzRowDirective, NzSpaceCompactItemDirective, NzButtonComponent, NzWaveDirective, ɵNzTransitionPatchDirective, NzIconDirective, FormsModule, NzFormDirective, ReactiveFormsModule, NzColDirective, NzFormItemComponent, NzInputDirective, NzSelectComponent, NzOptionComponent, NzTableComponent, NzTheadComponent, NzTrDirective, NzTableCellDirective, NzThMeasureDirective, NzTbodyComponent, NzSwitchComponent, NzSpaceComponent, NzSpaceItemDirective, NzTooltipDirective, NzPaginationComponent, PhonePipe]
})
export class UsersComponent extends BaseComponent<User> implements OnInit {
    injector: Injector;
    private modalService = inject(NzModalService);
    userService = inject(UserService);
    authService = inject(AuthService);


    @Input() user: User
    @Output() valueEmitter = new EventEmitter<boolean>();

    public object: User = new User();
    public tableData: User[] = [];
    public items: User[] = [];
    public modalClosedEmitter: EventEmitter<void> = new EventEmitter<void>();
    public userLogged: User;
    public isUpdate: boolean = false;
    public isLogged: boolean = false;
    public superUserView: boolean = false


    constructor() {
        const injector = inject(Injector);

        super(injector, {endpoint: URLS.USER, retrieveOnInit: true, searchOnInit: true});
    
        this.injector = injector;
    }

    ngOnInit(): void {
        super.ngOnInit(() => this.userLogged = this.authService.user);
        this.superUserView = this.authService.user.is_superuser;
    }

    public userLoggedActive(user: User) {
        return this.authService.user.email === user.email;
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
        const modal = this.modalService.create({
            nzWidth: '40%',
            nzCentered: true,
            nzTitle: 'Cadastrar usuário',
            nzContent: UsersItemComponent
        })
        modal.afterClose.subscribe(() => {
            this.search();
        })
    }

    public editUser(user: User): void {
        const modal = this.modalService.create({
            nzWidth: '40%',
            nzCentered: true,
            nzTitle: 'Editar dados do usuário',
            nzContent: UsersItemComponent,
            nzAfterClose: this.modalClosedEmitter,
            nzData: {
                pk: user.id,
                user: user,
                isUpdate: this.isUpdate = true
            }
        });
        modal.afterClose.subscribe(() => {
            this.search();
        })


    }


    public excludeUser(value): void {
        this.modalService.confirm({
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


    public changePaginator(event: any): void {
        console.log(event)
    }
}
