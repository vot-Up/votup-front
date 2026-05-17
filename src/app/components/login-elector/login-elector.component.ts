import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {BaseComponent} from "../../core/base.component";
import {URLS} from "../../app/app.urls";
import {NzMessageService} from "ng-zorro-antd/message";
import {VotingUser} from "../../../models/core/voting-user";
import {take} from "rxjs/operators";
import { NzFormDirective, NzFormItemComponent, NzFormControlComponent } from 'ng-zorro-antd/form';
import { ɵNzTransitionPatchDirective } from 'ng-zorro-antd/core/transition-patch';
import { NzInputGroupComponent, NzInputDirective } from 'ng-zorro-antd/input';
import { NgxMaskDirective } from 'ngx-mask';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzWaveDirective } from 'ng-zorro-antd/core/wave';
import { VotingComponent } from '../../core/components/voting/voting.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-login-elector',
    templateUrl: './login-elector.component.html',
    styleUrls: ['./login-elector.component.less'],
    imports: [FormsModule, NzFormDirective, ReactiveFormsModule, NzFormItemComponent, NzFormControlComponent, ɵNzTransitionPatchDirective, NzInputGroupComponent, NzInputDirective, NgxMaskDirective, NzButtonComponent, NzWaveDirective, VotingComponent]
})
export class LoginElectorComponent extends BaseComponent<VotingUser> {
    messageService = inject(NzMessageService);


    public votingUser = signal<VotingUser | null>(null);
    public isVoting = signal(false);

    constructor() {

        super({endpoint: URLS.VOTING_USER});
    
    }

    public createFormGroup(): void {
        this.formGroup = this.formBuilder.group({
            phone: [null, Validators.required],
        });
    }

    public getVotingUser(): void {
        this.service.clearParameter();
        const data = {"cellphone": this.v.phone}
        this.service.postFromListRoute("voting", data)
            .pipe(take(1))
            .subscribe(response => {
                    this.votingUser.set(<VotingUser>response);
                    this.isVoting.set(true);
                }
            );
    }

    public newVote() {
        this.isVoting.set(false)
        this.f.phone.setValue("")
    }

    public cancel() {
        this.router.navigate(['main']).then();
    }

}
