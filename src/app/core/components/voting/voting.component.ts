import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, inject, input, output, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { BaseComponent } from '../../base.component';
import { Plate } from '../../../../models/core/plate';
import { NzMessageService } from 'ng-zorro-antd/message';
import { URLS } from '../../../app/app.urls';
import { VotingUser } from '../../../../models/core/voting-user';
import { takeUntil } from 'rxjs';
import { BaseService } from '../../../../services/base.service';
import { Candidate } from '../../../../models/core/candidate';
import { NzAvatarComponent } from 'ng-zorro-antd/avatar';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { SwiperModule } from '../../../shared/swiper/swiper.module';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-voting',
    templateUrl: './voting.component.html',
    styleUrls: ['./voting.component.less'],
    imports: [NgIf, SwiperModule, NzAvatarComponent, NzButtonComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class VotingComponent extends BaseComponent<Plate> implements OnInit {
    private readonly messageService = inject(NzMessageService);

    readonly votingUser = input<VotingUser>(undefined);
    readonly finishVote = output<void>();

    public object_plate = signal<Plate | null>(null);
    public listPlates = signal<Plate[]>([]);
    public selectedPlate = signal<Plate | null>(null);

    public serviceVotingUser: BaseService<VotingUser>;
    public hiddenSuccess = signal(false);
    public pressed = signal(false);

    constructor() {
        super({ endpoint: URLS.PLATE });
        this.serviceVotingUser = this.createService(URLS.VOTING_USER);
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.getPlates();
    }

    createFormGroup(): void {
        this.formGroup = this.formBuilder.group({
            plate: [null],
        });
    }

    public getPlates(): void {
        this.service.clearParameter();
        this.service.addParameter('is_active', true);
        this.service.addParameter('expand', 'plate');
        const voting = this.votingUser().voting;
        this.service.addParameter('voting', typeof voting === 'object' ? voting.id : voting);
        this.service.getAll()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((response) => {
                this.listPlates.set(response);
                if (response.length === 1) {
                    this.selectPlate(response[0], 0);
                }
            });
    }

    public getCandidatePlate(type: string, plate: Plate) {
        if (plate?.plate?.length > 0) {
            return <Candidate>plate.plate?.find(item => item.type === type)?.candidate;
        }
        return null;
    }

    public selectPlate(plate: Plate, index = 0): void {
        this.selectedPlate.set(plate);
        this.object_plate.set(plate);
        this.pressed.set(true);
        this.formGroup.patchValue({ plate });
        this.formGroup.markAsDirty();
        this.formGroup.updateValueAndValidity();
    }

    public clearSelection(): void {
        this.selectedPlate.set(null);
        this.object_plate.set(null);
        this.pressed.set(false);
        this.formGroup.patchValue({ plate: null });
        this.formGroup.markAsPristine();
        this.formGroup.updateValueAndValidity();
    }

    public onSlideChange(event: Event): void {
        const swiper = (event as CustomEvent).detail?.[0];
        const index = swiper?.activeIndex ?? 0;
        const plate = this.listPlates()[index];
        if (plate) {
            this.selectPlate(plate, index);
        }
    }

    public vote(): void {
        const plate = this.selectedPlate();
        if (!plate) {
            return;
        }

        this.playSound();
        this.serviceVotingUser.update(this.votingUser().id, {
            plate: plate.url,
        }).pipe().subscribe(() => {
            this.messageService.create('success', 'Voto realizado com sucesso');
            this.hiddenSuccess.set(true);
            setTimeout(() => this.redirect(), 5000);
        });
    }

    playSound(): void {
        const audioElement = document.getElementById('audioElement') as HTMLAudioElement | null;
        if (!audioElement) {
            return;
        }

        audioElement.currentTime = 0;
        audioElement.play().catch(() => undefined);
    }

    public redirect(): void {
        this.finishVote.emit(undefined);
    }

    public getCandidatePlateIndividual(type: string, plate: Plate) {
        if (plate?.plate?.length > 0) {
            return <Candidate>plate.plate?.find(item => item.type === type)?.candidate;
        }
        return null;
    }

    public eventButton(plate: Plate) {
        this.selectPlate(plate);
    }
}
