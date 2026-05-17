import {Component, Injector} from '@angular/core';
import {BaseComponent} from "../../core/base.component";
import {URLS} from "../../app/app.urls";
import {NzMessageService} from "ng-zorro-antd/message";
import {VotingUser} from "../../../models/core/voting-user";
import {take} from "rxjs/operators";

@Component({
  standalone: false,
    selector: 'app-login-elector',
    templateUrl: './login-elector.component.html',
    styleUrls: ['./login-elector.component.less']
})
export class LoginElectorComponent extends BaseComponent<VotingUser> {

    public votingUser: VotingUser;
    public isVoting = false;

    constructor(public injector: Injector,
                public messageService: NzMessageService,) {
        super(injector, {endpoint: URLS.VOTING_USER});
    }

    public createFormGroup(): void {
        this.formGroup = this.formBuilder.group({
            phone: [null],
        })
    }

    public getVotingUser(): void {
        this.service.clearParameter();
        const data = {"cellphone": this.v.phone}
        this.service.postFromListRoute("voting", data)
            .pipe(take(1))
            .subscribe(response => {
                    this.votingUser = <VotingUser>response;
                    this.isVoting = true;
                }
            );
    }

    public newVote() {
        this.isVoting = false
        this.f.phone.setValue("")
    }

    public cancel() {
    }

}
