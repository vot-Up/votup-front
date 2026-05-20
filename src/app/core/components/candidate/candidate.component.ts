import { Component, ChangeDetectionStrategy, EventEmitter, OnInit, inject, input, signal } from '@angular/core';
import { BaseComponent } from '../../base.component';
import { URLS } from '../../../app/app.urls';
import { takeUntil } from 'rxjs';
import { Candidate } from '../../../../models/core/candidate';
import { AuthService } from '../../../../services/auth.service';
import { CandidateItemComponent } from './candidate-item/candidate-item.component';
import { User } from '../../../../models/core/user';
import { ResponsiveModalService } from '../../../../services/responsive-modal.service';
import { NzRowDirective, NzColDirective } from 'ng-zorro-antd/grid';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzWaveDirective } from 'ng-zorro-antd/core/wave';
import { ɵNzTransitionPatchDirective } from 'ng-zorro-antd/core/transition-patch';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzFormDirective, NzFormItemComponent } from 'ng-zorro-antd/form';
import { NzInputDirective } from 'ng-zorro-antd/input';
import { NzSelectComponent, NzOptionComponent } from 'ng-zorro-antd/select';
import { NzPaginationComponent } from 'ng-zorro-antd/pagination';
import { PhonePipe } from '../../../shared/phone-pipe/phone.pipe';
import { NzListComponent, NzListItemComponent } from 'ng-zorro-antd/list';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-candidate',
  templateUrl: './candidate.component.html',
  styleUrls: ['./candidate.component.less'],
  imports: [NzRowDirective, NzButtonComponent, NzWaveDirective, ɵNzTransitionPatchDirective, NzIconDirective, FormsModule, NzFormDirective, ReactiveFormsModule, NzColDirective, NzFormItemComponent, NzInputDirective, NzSelectComponent, NzOptionComponent, NzPaginationComponent, PhonePipe, NzListComponent, NzListItemComponent],
})
export class CandidateComponent extends BaseComponent<Candidate> implements OnInit {
  private responsiveModal = inject(ResponsiveModalService);
  authService = inject(AuthService);

  readonly candidate = input<Candidate>(undefined);

  public modalClosedEmitter: EventEmitter<void> = new EventEmitter<void>();
  public candidateLogged: User;
  public candidateAssociate = false;
  public isUpdate = signal(false);
  public expandedIds = signal<Set<number>>(new Set());


  constructor() {

    super({endpoint: URLS.CANDIDATE, retrieveOnInit: true, searchOnInit: true});

  }

  public ngOnInit(): void {
    super.ngOnInit(() => this.candidateLogged = this.authService.user);
  }


  public createFormGroup(): void {
    this.formGroup = this.formBuilder.group({
      user: [null],
      active: [null],
      name: [null],
    });
  }

  public search(): void {
    this.service.clearParameter();
    if (this.v.name) {
      this.service.addParameter('name', this.v.name);
    }
    if (this.v.active) {
      this.service.addParameter('active', this.v.active);
    }
    super.search();
    // this.getCandidateAssociate()
  }

  public isMobile(): boolean {
    return this.responsiveModal.isMobile();
  }

  public toggleExpand(id: number): void {
    this.expandedIds.update((set) => {
      const newSet = new Set(set);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }

  public toggleActive(candidate: Candidate): void {
    this.toggle(candidate, 'active');
  }

  public openModal(): void {
    const modal = this.responsiveModal.create({
      nzTitle: 'Cadastrar candidato',
      nzContent: CandidateItemComponent,
      nzWidth: 760,
    });
    modal.afterClose.subscribe(() => {
      this.search();
    });
  }

  public editCandidate(candidate: Candidate): void {
    this.isUpdate.set(true);
    const modal = this.responsiveModal.create({
      nzTitle: 'Editar dados do candidato',
      nzContent: CandidateItemComponent,
      nzWidth: 760,
      nzAfterClose: this.modalClosedEmitter,
      nzData: {
        pk: candidate.id,
        candidate: candidate,
        isUpdate: true,
      },
    });
    modal.afterClose.subscribe(() => {
      this.search();
    });
  }


  public excludeCandidate(value: Candidate): void {
    this.responsiveModal.createConfirm({
      nzTitle: 'Tem certeza de que deseja excluir esse candidato?',
      nzOnOk: () => this.delete(value),
      nzAfterClose: this.modalClosedEmitter,
    });
  }

  public getCandidateAssociate(): void {
    this.service.clearParameter();
    this.service.getFromListRoute('get_candidate_associate')
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(() => {
      });

  }

  delete(value: Candidate): void {
    this.service.clearParameter();
    this.service.delete(value.id)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(() => {
        this.search();
      });
  }


  public changePaginator(event: unknown): void {
  }
}
