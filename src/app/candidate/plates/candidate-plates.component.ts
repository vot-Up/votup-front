import { Component, ChangeDetectionStrategy, OnInit, inject, signal } from '@angular/core';
import { BaseComponent } from '../../core/base.component';
import { URLS } from '../../app/app.urls';
import { Plate } from '../../../models/core/plate';
import { Candidate } from '../../../models/core/candidate';
import { PlateUser } from '../../../models/core/plate-user';
import { BaseService } from '../../../services/base.service';
import { ResponsiveModalService } from '../../../services/responsive-modal.service';
import { take } from 'rxjs/operators';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzRowDirective } from 'ng-zorro-antd/grid';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzWaveDirective } from 'ng-zorro-antd/core/wave';
import { ɵNzTransitionPatchDirective } from 'ng-zorro-antd/core/transition-patch';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzListComponent, NzListItemComponent } from 'ng-zorro-antd/list';
import { CustomValidators } from '../../../utilities/validator/custom-validators';
import { CandidatePlateFormComponent } from './candidate-plate-form.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-candidate-plates',
  templateUrl: './candidate-plates.component.html',
  styleUrls: ['./candidate-plates.component.less'],
  imports: [
    NzRowDirective,
    NzButtonComponent,
    NzWaveDirective,
    ɵNzTransitionPatchDirective,
    NzIconDirective,
    FormsModule,
    ReactiveFormsModule,
    NzListComponent,
    NzListItemComponent,
  ]
})
export class CandidatePlatesComponent extends BaseComponent<Plate> implements OnInit {
  private responsiveModal = inject(ResponsiveModalService);
  private messageService = inject(NzMessageService);

  public plate = signal<Plate | null>(null);
  public expanded = signal(false);
  public candidates = signal<Candidate[]>([]);
  public president = signal<Candidate | null>(null);
  public vicePresident = signal<Candidate | null>(null);

  private candidateService: BaseService<Candidate>;
  private plateUserService: BaseService<PlateUser>;

  constructor() {
    super({ endpoint: URLS.PLATE, searchOnInit: false });
    this.candidateService = this.createService<Candidate>(URLS.CANDIDATE);
    this.plateUserService = this.createService<PlateUser>(URLS.PLATE_USER);
  }

  ngOnInit(): void {
    this.createFormGroup();
    this.loadPlate();
  }

  public createFormGroup(): void {
    this.formGroup = this.formBuilder.group({
      name: [null, CustomValidators.required],
    });
  }

  loadPlate(): void {
    this.service.clearParameter();
    this.service.getAll()
      .pipe(take(1))
      .subscribe((plates: Plate[]) => {
        if (plates && plates.length > 0) {
          this.plate.set(plates[0]);
          this.loadPlateMembers(plates[0]);
        } else {
          this.plate.set(null);
        }
      });
  }

  private loadPlateMembers(plate: Plate): void {
    if (!plate?.id) return;

    this.candidateService.clearParameter();
    this.candidateService.addParameter('active', true);
    this.candidateService.addParameter('plate_president', plate.id);
    this.candidateService.getAll()
      .pipe(take(1))
      .subscribe((response) => {
        this.president.set(response && response.length > 0 ? response[0] : null);
      });

    this.candidateService.clearParameter();
    this.candidateService.addParameter('is_active', true);
    this.candidateService.addParameter('plate_vice', plate.id);
    this.candidateService.getAll()
      .pipe(take(1))
      .subscribe((response) => {
        this.vicePresident.set(response && response.length > 0 ? response[0] : null);
      });
  }

  private loadAllCandidatesAndThen(callback: (candidates: Candidate[]) => void): void {
    this.candidateService.clearParameter();
    this.candidateService.addParameter('active', true);
    this.candidateService.getAll()
      .pipe(take(1))
      .subscribe((response) => {
        const candidates = response || [];
        this.candidates.set(candidates);
        callback(candidates);
      });
  }

  public toggleExpand(): void {
    this.expanded.update(v => !v);
  }

  public isLinked(): boolean {
    return this.plate()?.is_linked === true;
  }

  public showCreateModal(): void {
    this.loadAllCandidatesAndThen((candidates) => {
      const modal = this.responsiveModal.create({
        nzTitle: 'Criar sua chapa',
        nzContent: CandidatePlateFormComponent,
        nzData: {
          plate: null,
          candidates,
          president: null,
          vicePresident: null,
        },
      });

      modal.afterClose.subscribe((result) => {
        if ((result as { saved?: boolean })?.saved) {
          this.loadPlate();
        }
      });
    });
  }

  public showEditModal(): void {
    if (this.isLinked()) return;

    this.loadAllCandidatesAndThen((candidates) => {
      const modal = this.responsiveModal.create({
        nzTitle: 'Editar chapa',
        nzContent: CandidatePlateFormComponent,
        nzData: {
          plate: this.plate(),
          candidates,
          president: this.president(),
          vicePresident: this.vicePresident(),
        },
      });

      modal.afterClose.subscribe((result) => {
        if ((result as { saved?: boolean })?.saved) {
          this.loadPlate();
        }
      });
    });
  }

  public confirmDelete(): void {
    if (this.isLinked()) return;

    this.responsiveModal.createConfirm({
      nzTitle: 'Tem certeza de que deseja excluir sua chapa?',
      nzOnOk: () => this.deletePlate(),
    });
  }

  private deletePlate(): void {
    const plate = this.plate();
    if (!plate?.id) return;

    this.service.clearParameter();
    this.service.delete(plate.id)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.messageService.create('success', 'Chapa excluída com sucesso.');
          this.plate.set(null);
          this.president.set(null);
          this.vicePresident.set(null);
          this.expanded.set(false);
        },
        error: () => {
          this.messageService.create('error', 'Erro ao excluir chapa.');
        }
      });
  }

  public isMobile(): boolean {
    return this.responsiveModal.isMobile();
  }
}
