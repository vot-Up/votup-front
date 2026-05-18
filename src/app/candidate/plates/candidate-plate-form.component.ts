import { Component, ChangeDetectionStrategy, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { take } from 'rxjs/operators';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { URLS } from '../../app/app.urls';
import { Plate } from '../../../models/core/plate';
import { Candidate } from '../../../models/core/candidate';
import { PlateUser } from '../../../models/core/plate-user';
import { BaseService } from '../../../services/base.service';
import { CustomValidators } from '../../../utilities/validator/custom-validators';
import { NzFormDirective, NzFormItemComponent, NzFormControlComponent, NzFormLabelComponent } from 'ng-zorro-antd/form';
import { NzInputDirective } from 'ng-zorro-antd/input';
import { NzSelectComponent, NzOptionComponent } from 'ng-zorro-antd/select';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzWaveDirective } from 'ng-zorro-antd/core/wave';
import { ɵNzTransitionPatchDirective } from 'ng-zorro-antd/core/transition-patch';

interface CandidatePlateFormData {
  plate: Plate | null;
  candidates: Candidate[];
  president: Candidate | null;
  vicePresident: Candidate | null;
}

interface CandidatePlateFormValue {
  name: string;
  president: number | null;
  vicePresident: number | null;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-candidate-plate-form',
  templateUrl: './candidate-plate-form.component.html',
  styleUrls: ['./candidate-plate-form.component.less'],
  standalone: true,
  imports: [
    FormsModule,
    NzFormDirective,
    ReactiveFormsModule,
    NzFormItemComponent,
    NzFormLabelComponent,
    NzFormControlComponent,
    NzInputDirective,
    NzSelectComponent,
    NzOptionComponent,
    NzButtonComponent,
    NzWaveDirective,
    ɵNzTransitionPatchDirective,
  ]
})
export class CandidatePlateFormComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private modalRef = inject(NzModalRef);
  private messageService = inject(NzMessageService);
  private http = inject(HttpClient);
  data = inject<CandidatePlateFormData>(NZ_MODAL_DATA);

  private plateService = new BaseService<Plate>(URLS.PLATE, this.http);
  private plateUserService = new BaseService<PlateUser>(URLS.PLATE_USER, this.http);

  public formGroup: FormGroup;
  public candidates = signal<Candidate[]>([]);
  public isSubmitting = signal(false);

  ngOnInit(): void {
    this.candidates.set(this.data.candidates || []);

    this.formGroup = this.formBuilder.group({
      name: [this.data.plate?.name || null, CustomValidators.required],
      president: [this.data.president?.id || null],
      vicePresident: [this.data.vicePresident?.id || null],
    });
  }

  public save(): void {
    if (this.formGroup.invalid) {
      Object.values(this.formGroup.controls).forEach(c => c.markAsDirty());
      return;
    }

    this.isSubmitting.set(true);
    const rawValue = this.formGroup.getRawValue();
    const existingPlate = this.data.plate;

    if (existingPlate?.id) {
      this.plateService.update(existingPlate.id, { name: rawValue.name })
        .pipe(take(1))
        .subscribe({
          next: () => {
            this.handleMembers(existingPlate.id, rawValue);
          },
          error: () => {
            this.isSubmitting.set(false);
            this.messageService.create('error', 'Erro ao atualizar chapa.');
          }
        });
    } else {
      this.plateService.save({ name: rawValue.name } as Plate)
        .pipe(take(1))
        .subscribe({
          next: (response: Plate) => {
            this.handleMembers(response.id, rawValue);
          },
          error: () => {
            this.isSubmitting.set(false);
            this.messageService.create('error', 'Erro ao criar chapa.');
          }
        });
    }
  }

  private handleMembers(plateId: number, rawValue: CandidatePlateFormValue): void {
    const oldPresident: Candidate | null = this.data.president;
    const oldVice: Candidate | null = this.data.vicePresident;
    const newPresidentId = rawValue.president;
    const newViceId = rawValue.vicePresident;
    const allCandidates = this.candidates();
    const isEdit = !!this.data.plate?.id;

    let pendingOps = 0;
    let completedOps = 0;
    let hasError = false;

    const checkDone = () => {
      completedOps++;
      if (completedOps >= pendingOps) {
        this.isSubmitting.set(false);
        if (!hasError) {
          this.messageService.create('success', isEdit ? 'Chapa atualizada!' : 'Chapa criada com sucesso!');
          this.modalRef.close({ saved: true });
        } else {
          this.messageService.create('error', 'Erro ao salvar membros da chapa.');
          this.modalRef.close();
        }
      }
    };

    const handleError = () => {
      hasError = true;
      checkDone();
    };

    // President changed
    if (newPresidentId !== (oldPresident?.id || null)) {
      if (oldPresident?.id) {
        pendingOps++;
        this.plateUserService.deleteFromListRoute('delete_user_plate', {
          plate: plateId, candidate: oldPresident.id,
        }).pipe(take(1)).subscribe({ complete: checkDone, error: handleError });
      }
      if (newPresidentId) {
        pendingOps++;
        const candidateUrl = allCandidates.find(c => c.id === newPresidentId)?.url;
        this.plateUserService.save({
          plate: `${this.plateService.fullUrl}${plateId}/`,
          type: 'P',
          candidate: candidateUrl,
        } as PlateUser).pipe(take(1)).subscribe({ complete: checkDone, error: handleError });
      }
    }

    // Vice-president changed
    if (newViceId !== (oldVice?.id || null)) {
      if (oldVice?.id) {
        pendingOps++;
        this.plateUserService.deleteFromListRoute('delete_user_plate', {
          plate: plateId, candidate: oldVice.id,
        }).pipe(take(1)).subscribe({ complete: checkDone, error: handleError });
      }
      if (newViceId) {
        pendingOps++;
        const candidateUrl = allCandidates.find(c => c.id === newViceId)?.url;
        this.plateUserService.save({
          plate: `${this.plateService.fullUrl}${plateId}/`,
          type: 'V',
          candidate: candidateUrl,
        } as PlateUser).pipe(take(1)).subscribe({ complete: checkDone, error: handleError });
      }
    }

    if (pendingOps === 0) {
      this.isSubmitting.set(false);
      this.messageService.create('success', isEdit ? 'Chapa atualizada!' : 'Chapa criada com sucesso!');
      this.modalRef.close({ saved: true });
    }
  }

  public cancel(): void {
    this.modalRef.close();
  }
}
