import {Component, EventEmitter, Injector, Input, OnInit, Output} from '@angular/core';
import {BaseComponent} from "../../base.component";
import {Plate} from "../../../../models/core/plate";
import {NzMessageService} from "ng-zorro-antd/message";
import {URLS} from "../../../app/app.urls";
import {VotingUser} from "../../../../models/core/voting-user";
import {takeUntil} from "rxjs";
import {BaseService} from "../../../../services/base.service";
import {Candidate} from "../../../../models/core/candidate";

@Component({
  standalone: false,
    selector: 'app-voting',
    templateUrl: './voting.component.html',
    styleUrls: ['./voting.component.less']
})
export class VotingComponent extends BaseComponent<Plate> implements OnInit {

    @Input() votingUser: VotingUser;

    @Output() finishVote: EventEmitter<any> = new EventEmitter<any>();

    public object_plate: any;
    public listPlates: Plate[];

    public serviceVotingUser: BaseService<VotingUser>;

    public hiddenSuccess = false;
    public pressed: boolean = false

    constructor(public injector: Injector,
                public messageService: NzMessageService,) {
        super(injector, {endpoint: URLS.PLATE});
        this.serviceVotingUser = this.createService(VotingUser, URLS.VOTING_USER)
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.getPlates();
    }

    createFormGroup(): void {
        this.formGroup = this.formBuilder.group({
            plate: [null],
        })
    }

    public getPlates() {
        this.service.clearParameter();
        this.service.addParameter("is_active", true);
        this.service.addParameter("expand", ["plate"])
        this.service.addParameter("voting", this.votingUser.voting);
        this.service.getAll()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((response) => {
                this.listPlates = response;
            });
    }

    public getCandidatePlate(type: string, plate: Plate) {
        if (plate.plate?.length > 0) {
            return <Candidate>plate.plate?.find(item => item.type === type)?.candidate;
        }
    }


    public vote() {
        const payload = {
            "plate": this.v.plate.url
        }
        this.serviceVotingUser.update(this.votingUser.id, payload)
            .pipe()
            .subscribe(() => {
                this.messageService.create(
                    'success',
                    'Voto realizado com sucesso'
                );
                this.hiddenSuccess = true;
                this.playSound();
                setTimeout(() => {
                    this.redirect()}, 5000
                )
            })
    }

    playSound() {
        const audioElement = document.getElementById('audioElement') as HTMLAudioElement;
        audioElement.play();
    }


    public redirect() {
        this.finishVote.emit()
    }

    public getCandidatePlateIndividual(type: string, plate: Plate) {
        if (plate.plate?.length > 0) {
            return <Candidate>plate.plate?.find(item => item.type === type)?.candidate;
        }
    }

    public eventButton(plate) {
        this.pressed = true
        this.object_plate = plate
    }
}
