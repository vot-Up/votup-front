import {Component, EventEmitter, Injector, Input, OnInit, Output} from '@angular/core';
import {User} from "../../../../models/core/user";
import {URLS} from "../../../app/app.urls";
import {BaseComponent} from "../../base.component";
import {takeUntil} from "rxjs";
import {NzModalService} from "ng-zorro-antd/modal";
import {UsersItemComponent} from "./users-item/users-item.component";
import {UserService} from "../../../../services/user.service";
import {AuthService} from "../../../../services/auth.service";


@Component({
    selector: 'app-voters',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.less']
})
export class UsersComponent extends BaseComponent<User> implements OnInit {

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


    constructor(public injector: Injector,
                private modalService: NzModalService,
                public userService: UserService,
                public authService: AuthService,) {
        super(injector, {endpoint: URLS.USER, retrieveOnInit: true, searchOnInit: true});
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
    }
}
