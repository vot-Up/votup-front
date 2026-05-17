import { Component, inject } from '@angular/core';
import {BaseComponent} from "../../core/base.component";
import {URLS} from "../../app/app.urls";
import {NzMessageService} from "ng-zorro-antd/message";
import {VotingUser} from "../../../models/core/voting-user";
import {take} from "rxjs/operators";
import { NzRowDirective, NzColDirective } from 'ng-zorro-antd/grid';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzFormDirective, NzFormItemComponent, NzFormControlComponent } from 'ng-zorro-antd/form';
import { ɵNzTransitionPatchDirective } from 'ng-zorro-antd/core/transition-patch';
import { NzSpaceCompactItemDirective, NzSpaceComponent, NzSpaceItemDirective } from 'ng-zorro-antd/space';
import { NzInputGroupComponent, NzInputDirective } from 'ng-zorro-antd/input';
import { NgxMaskDirective } from 'ngx-mask';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzWaveDirective } from 'ng-zorro-antd/core/wave';
import { VotingComponent } from '../../core/components/voting/voting.component';

@Component({
    selector: 'app-login-elector',
    templateUrl: './login-elector.component.html',
    styleUrls: ['./login-elector.component.less'],
    imports: [NzRowDirective, NzColDirective, FormsModule, NzFormDirective, ReactiveFormsModule, NzFormItemComponent, NzFormControlComponent, ɵNzTransitionPatchDirective, NzSpaceCompactItemDirective, NzInputGroupComponent, NzInputDirective, NgxMaskDirective, NzSpaceComponent, NzSpaceItemDirective, NzButtonComponent, NzWaveDirective, VotingComponent]
})
export class LoginElectorComponent extends BaseComponent<VotingUser> {
    messageService = inject(NzMessageService);


    public votingUser: VotingUser;
    public isVoting = false;

    constructor() {

        super({endpoint: URLS.VOTING_USER});
    
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
