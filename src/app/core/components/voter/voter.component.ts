import { Component, ChangeDetectionStrategy, EventEmitter, Input, OnInit, inject, signal } from '@angular/core';
import { BaseComponent } from '../../base.component';
import { URLS } from '../../../app/app.urls';
import { takeUntil } from 'rxjs';
import { AuthService } from '../../../../services/auth.service';
import { Voter } from '../../../../models/core/voter';
import { VoterItemComponent } from './voter-item/voter-item.component';
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
  selector: 'app-voter',
  templateUrl: './voter.component.html',
  styleUrls: ['./voter.component.less'],
  imports: [
    NzRowDirective,
    NzButtonComponent,
    NzWaveDirective,
    ɵNzTransitionPatchDirective,
    NzIconDirective,
    FormsModule,
    NzFormDirective,
    ReactiveFormsModule,
    NzColDirective,
    NzFormItemComponent,
    NzInputDirective,
    NzSelectComponent,
    NzOptionComponent,
    NzPaginationComponent,
    PhonePipe,
    NzListComponent,
    NzListItemComponent,
  ],
})
export class VoterComponent extends BaseComponent<Voter> implements OnInit {
  private responsiveModal = inject(ResponsiveModalService);
  authService = inject(AuthService);

  @Input() voter: Voter;
  public modalClosedEmitter: EventEmitter<void> = new EventEmitter<void>();
  public voterLogged: Voter;
  public isUpdate = signal(false);
  public expandedIds = signal<Set<number>>(new Set());

  constructor() {
    super({ endpoint: URLS.VOTE, retrieveOnInit: true, searchOnInit: true });
  }

  ngOnInit(): void {
    super.ngOnInit(() => (this.voter = this.authService.user));
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

  public toggleActive(voter: Voter): void {
    this.toggle(voter, 'active');
  }

  public openModal(): void {
    const modal = this.responsiveModal.create({
      nzTitle: 'Cadastrar eleitor',
      nzContent: VoterItemComponent,
    });
    modal.afterClose.subscribe(() => {
      this.search();
    });
  }

  public editElector(voter: Voter): void {
    this.isUpdate.set(true);
    const modal = this.responsiveModal.create({
      nzTitle: 'Editar dados do eleitor',
      nzContent: VoterItemComponent,
      nzAfterClose: this.modalClosedEmitter,
      nzData: { pk: voter.id, voter: voter, isUpdate: true },
    });
    modal.afterClose.subscribe(() => {
      this.search();
    });
  }

  public excludeElector(value: Voter): void {
    this.responsiveModal.createConfirm({
      nzTitle: 'Tem certeza de que deseja excluir esse eleitor?',
      nzOnOk: () => this.delete(value),
    });
  }

  delete(value: Voter): void {
    this.service.clearParameter();
    this.service
      .delete(value.id)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(() => {
        this.search();
      });
  }

  public changePaginator(event: unknown): void {
    console.log(event);
  }
}
