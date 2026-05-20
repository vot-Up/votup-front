import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpContext, HttpErrorResponse } from '@angular/common/http';
import { EMPTY } from 'rxjs';
import {BaseComponent} from "../../core/base.component";
import {URLS} from "../../app/app.urls";
import {VotingUser} from "../../../models/core/voting-user";
import {catchError, take} from "rxjs/operators";
import { NzFormDirective, NzFormItemComponent, NzFormControlComponent } from 'ng-zorro-antd/form';
import { ɵNzTransitionPatchDirective } from 'ng-zorro-antd/core/transition-patch';
import { NzInputGroupComponent, NzInputDirective } from 'ng-zorro-antd/input';
import { NgxMaskDirective } from 'ngx-mask';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzWaveDirective } from 'ng-zorro-antd/core/wave';
import { VotingComponent } from '../../core/components/voting/voting.component';
import { SKIP_ERROR_TOAST } from '../../../utilities/validator/auth.interceptor';

type VotingUnavailableKind = 'expired' | 'upcoming' | 'missing';

interface VotingUnavailableState {
    kind: VotingUnavailableKind;
    eyebrow: string;
    title: string;
    description: string;
    illustration: string;
    alt: string;
    canRetry: boolean;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-login-elector',
    templateUrl: './login-elector.component.html',
    styleUrls: ['./login-elector.component.less'],
    imports: [FormsModule, NzFormDirective, ReactiveFormsModule, NzFormItemComponent, NzFormControlComponent, ɵNzTransitionPatchDirective, NzInputGroupComponent, NzInputDirective, NgxMaskDirective, NzButtonComponent, NzWaveDirective, VotingComponent]
})
export class LoginElectorComponent extends BaseComponent<VotingUser> {
    public votingUser = signal<VotingUser | null>(null);
    public isVoting = signal(false);
    public unavailable = signal<VotingUnavailableState | null>(null);

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
        this.unavailable.set(null);
        this.votingUser.set(null);
        this.isVoting.set(false);

        const data = { cellphone: this.v.phone };
        const context = new HttpContext().set(SKIP_ERROR_TOAST, true);

        this.http.post<VotingUser>(`${this.service.fullUrl}voting/`, data, { context })
            .pipe(
                take(1),
                catchError((error: HttpErrorResponse) => {
                    this.showUnavailableState(error);
                    return EMPTY;
                })
            )
            .subscribe(response => {
                    if (!response?.id || !response?.voting) {
                        this.unavailable.set(this.createUnavailableState('missing'));
                        return;
                    }
                    this.votingUser.set(<VotingUser>response);
                    this.isVoting.set(true);
                }
            );
    }

    public newVote() {
        this.isVoting.set(false);
        this.unavailable.set(null);
        this.f.phone.setValue('');
    }

    public tryAnotherPhone(): void {
        this.newVote();
    }

    public cancel() {
        this.router.navigate(['main']).then();
    }

    private showUnavailableState(error: HttpErrorResponse): void {
        const message = this.extractErrorMessage(error.error);
        this.unavailable.set(this.createUnavailableState(this.classifyUnavailableState(message)));
    }

    private classifyUnavailableState(message: string): VotingUnavailableKind {
        const normalized = message.toLowerCase();

        if (normalized.includes('ultrapassou') || normalized.includes('tempo limite') || normalized.includes('encerr')) {
            return 'expired';
        }

        if (normalized.includes('ainda') || normalized.includes('inici') || normalized.includes('ocorrer') || normalized.includes('futura')) {
            return 'upcoming';
        }

        return 'missing';
    }

    private createUnavailableState(kind: VotingUnavailableKind): VotingUnavailableState {
        const states: Record<VotingUnavailableKind, VotingUnavailableState> = {
            expired: {
                kind,
                eyebrow: 'Prazo encerrado',
                title: 'A votação já terminou',
                description: 'O período disponível para participar dessa votação foi encerrado. Caso tenha dúvidas, entre em contato com a organização.',
                illustration: 'assets/images/voting-expired.svg',
                alt: 'Ilustração de documento com aviso de votação encerrada',
                canRetry: false,
            },
            upcoming: {
                kind,
                eyebrow: 'Aguarde o início',
                title: 'A votação ainda vai ocorrer',
                description: 'Esta votação ainda não está aberta para participação. Tente novamente quando o período de votação começar.',
                illustration: 'assets/images/voting-upcoming.svg',
                alt: 'Ilustração de celular com ampulheta indicando votação futura',
                canRetry: false,
            },
            missing: {
                kind,
                eyebrow: 'Votação indisponível',
                title: 'Não encontramos uma votação disponível',
                description: 'Confira o telefone informado ou tente novamente mais tarde. A votação pode não estar vinculada ao seu cadastro.',
                illustration: 'assets/images/voting-upcoming.svg',
                alt: 'Ilustração indicando votação indisponível no momento',
                canRetry: true,
            },
        };

        return states[kind];
    }

    private extractErrorMessage(value: unknown): string {
        if (typeof value === 'string') {
            return value;
        }

        if (Array.isArray(value)) {
            return value.map(item => this.extractErrorMessage(item)).join(' ');
        }

        if (value && typeof value === 'object') {
            return Object.values(value)
                .map(item => this.extractErrorMessage(item))
                .join(' ');
        }

        return '';
    }

}
