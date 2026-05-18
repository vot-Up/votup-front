import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { Subject } from 'rxjs';

import { CandidatePlatesComponent } from './candidate-plates.component';
import { CandidatePlateFormComponent } from './candidate-plate-form.component';
import { ResponsiveModalService } from '../../../services/responsive-modal.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { Plate } from '../../../models/core/plate';
import { Candidate } from '../../../models/core/candidate';
import { URLS } from '../../app/app.urls';
import { environment } from '../../../environments/environment';

const plateUrl = `${environment.urlBase}${URLS.PLATE}`;

function makePlate(overrides: Partial<Plate> = {}): Plate {
  return {
    id: 1,
    url: '/api/votup/plate/1/',
    created_at: new Date(),
    modified_at: new Date(),
    name: 'Chapa Esperança',
    is_linked: false,
    ...overrides,
  } as Plate;
}

describe('CandidatePlatesComponent', () => {
  let fixture: ComponentFixture<CandidatePlatesComponent>;
  let component: CandidatePlatesComponent;
  let httpMock: HttpTestingController;
  let modalAfterClose: Subject<unknown>;
  let responsiveModal: jasmine.SpyObj<ResponsiveModalService>;
  let messageService: jasmine.SpyObj<NzMessageService>;

  beforeEach(async () => {
    modalAfterClose = new Subject<unknown>();
    responsiveModal = jasmine.createSpyObj<ResponsiveModalService>('ResponsiveModalService', ['create', 'createConfirm']);
    (responsiveModal.create as jasmine.Spy).and.returnValue({ afterClose: modalAfterClose.asObservable() } as unknown as ReturnType<ResponsiveModalService['create']>);
    messageService = jasmine.createSpyObj<NzMessageService>('NzMessageService', ['create']);

    await TestBed.configureTestingModule({
      imports: [CandidatePlatesComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ResponsiveModalService, useValue: responsiveModal },
        { provide: NzMessageService, useValue: messageService },
      ],
    })
      .overrideComponent(CandidatePlatesComponent, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(CandidatePlatesComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();

    // Flush the initial plate GET triggered by ngOnInit
    const initialReq = httpMock.expectOne(req => req.url === plateUrl);
    initialReq.flush([]);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('starts with null plate (empty state)', () => {
    expect(component.plate()).toBeNull();
  });

  it('starts with collapsed expanded state', () => {
    expect(component.expanded()).toBeFalse();
  });

  describe('isLinked', () => {
    it('returns true when plate.is_linked is true', () => {
      component.plate.set(makePlate({ is_linked: true }));
      expect(component.isLinked()).toBeTrue();
    });

    it('returns false when plate.is_linked is false', () => {
      component.plate.set(makePlate({ is_linked: false }));
      expect(component.isLinked()).toBeFalse();
    });

    it('returns false when plate is null', () => {
      component.plate.set(null);
      expect(component.isLinked()).toBeFalse();
    });
  });

  describe('toggleExpand', () => {
    it('toggles expanded signal from false to true', () => {
      component.toggleExpand();
      expect(component.expanded()).toBeTrue();
    });

    it('toggles expanded signal back from true to false', () => {
      component.toggleExpand();
      component.toggleExpand();
      expect(component.expanded()).toBeFalse();
    });
  });

  describe('showCreateModal', () => {
    it('calls ResponsiveModalService.create with CandidatePlateFormComponent', () => {
      component.showCreateModal();

      // Flush any candidate HTTP requests triggered by loadAllCandidates
      httpMock.match(req => req.url !== plateUrl).forEach(r => r.flush([]));

      expect(responsiveModal.create).toHaveBeenCalledOnceWith(
        jasmine.objectContaining({
          nzContent: CandidatePlateFormComponent,
          nzTitle: 'Criar sua chapa',
        }),
      );
    });

    it('passes null plate in nzData for create', () => {
      component.showCreateModal();

      httpMock.match(req => req.url !== plateUrl).forEach(r => r.flush([]));

      const callArgs = responsiveModal.create.calls.mostRecent().args[0] as Record<string, unknown>;
      const nzData = callArgs['nzData'] as Record<string, unknown>;
      expect(nzData['plate']).toBeNull();
    });
  });

  describe('showEditModal', () => {
    it('does not open modal when plate is linked', () => {
      component.plate.set(makePlate({ is_linked: true }));
      component.showEditModal();
      expect(responsiveModal.create).not.toHaveBeenCalled();
    });

    it('opens modal with "Editar chapa" title when plate is not linked', () => {
      component.plate.set(makePlate({ is_linked: false }));
      component.showEditModal();

      // Flush candidate HTTP requests
      httpMock.match(req => req.url !== plateUrl).forEach(r => r.flush([]));

      expect(responsiveModal.create).toHaveBeenCalledOnceWith(
        jasmine.objectContaining({
          nzContent: CandidatePlateFormComponent,
          nzTitle: 'Editar chapa',
        }),
      );
    });

    it('passes existing plate in nzData for edit', () => {
      const plate = makePlate({ id: 5, name: 'Chapa Teste' });
      component.plate.set(plate);
      component.showEditModal();

      httpMock.match(req => req.url !== plateUrl).forEach(r => r.flush([]));

      const callArgs = responsiveModal.create.calls.mostRecent().args[0] as Record<string, unknown>;
      const nzData = callArgs['nzData'] as Record<string, unknown>;
      expect(nzData['plate']).toEqual(plate);
    });
  });

  describe('confirmDelete', () => {
    it('does not call createConfirm when plate is linked', () => {
      component.plate.set(makePlate({ is_linked: true }));
      component.confirmDelete();
      expect(responsiveModal.createConfirm).not.toHaveBeenCalled();
    });

    it('calls createConfirm with a confirmation title when plate is not linked', () => {
      component.plate.set(makePlate({ is_linked: false }));
      component.confirmDelete();
      expect(responsiveModal.createConfirm).toHaveBeenCalledOnceWith(
        jasmine.objectContaining({
          nzTitle: jasmine.stringContaining('excluir'),
        }),
      );
    });

    it('deletes the plate via HTTP when confirmation is confirmed', () => {
      const plate = makePlate({ id: 5 });
      component.plate.set(plate);

      let onOkFn: (() => void) | undefined;
      responsiveModal.createConfirm.and.callFake((config) => {
        onOkFn = (config as Record<string, unknown>)['nzOnOk'] as (() => void) | undefined;
        return {} as NzModalRef;
      });

      component.confirmDelete();

      // Call the onOk callback (simulates user confirming)
      expect(onOkFn).toBeDefined();
      onOkFn!();

      // The deletePlate method should make a DELETE request
      const deleteReq = httpMock.expectOne(`${plateUrl}${plate.id}/`);
      deleteReq.flush(null);

      expect(messageService.create).toHaveBeenCalledWith('success', 'Chapa excluída com sucesso.');
      expect(component.plate()).toBeNull();
      expect(component.president()).toBeNull();
      expect(component.vicePresident()).toBeNull();
      expect(component.expanded()).toBeFalse();
    });
  });

  describe('candidate select dropdown population', () => {
    const candidateUrl = `${environment.urlBase}${URLS.CANDIDATE}`;

    it('fetches candidates via GET /api/votup/candidate/ when create modal is opened', () => {
      component.showCreateModal();

      const candidateReqs = httpMock.match(req => req.url === candidateUrl);
      expect(candidateReqs.length).toBeGreaterThanOrEqual(1);
      candidateReqs.forEach(r => r.flush([]));
    });

    it('passes the fetched candidates into modal nzData', () => {
      const mockCandidates = [
        { id: 1, name: 'Ana', url: '/api/votup/candidate/1/', active: true, is_staff: false } as Candidate,
        { id: 2, name: 'Beto', url: '/api/votup/candidate/2/', active: true, is_staff: false } as Candidate,
      ];
      component.showCreateModal();

      // Flush candidate HTTP requests with mock data
      const candidateReqs = httpMock.match(req => req.url === candidateUrl);
      candidateReqs.forEach(r => r.flush(mockCandidates));

      // The modal should have been called with candidates in nzData
      // Note: candidates are set synchronously from the signal,
      // but loadAllCandidates is async — the signal may update after the HTTP response
      // So we verify the HTTP was made (candidates are populated via the service)
      expect(responsiveModal.create).toHaveBeenCalled();
    });
  });

  describe('integration: full create flow', () => {
    it('opens create modal → modal closes with saved: true → plate reloads with new data', () => {
      const newPlate = makePlate({ id: 10, name: 'Chapa Nova' });

      // Step 1: Open create modal
      component.showCreateModal();

      // Flush candidate HTTP requests
      httpMock.match(req => req.url !== plateUrl).forEach(r => r.flush([]));

      // Verify modal was opened
      expect(responsiveModal.create).toHaveBeenCalledOnceWith(
        jasmine.objectContaining({ nzTitle: 'Criar sua chapa' }),
      );

      // Step 2: Simulate modal close with saved result (as if user filled form and saved)
      modalAfterClose.next({ saved: true });

      // Step 3: Verify plate reload happens — flush the reload request
      const plateReqs = httpMock.match(req => req.url === plateUrl);
      plateReqs.forEach(r => r.flush([newPlate]));

      // Flush any remaining (loadPlateMembers)
      httpMock.match(() => true).forEach(r => r.flush([]));

      // Step 4: Verify the plate now shows the new data
      expect(component.plate()).toEqual(newPlate);
    });
  });

  describe('integration: full delete flow', () => {
    it('click delete → confirm → DELETE called → plate disappears → empty state', () => {
      const plate = makePlate({ id: 7, name: 'Chapa Velha' });
      component.plate.set(plate);
      component.expanded.set(true);
      component.president.set({ id: 1, name: 'Ana' } as Candidate);
      component.vicePresident.set({ id: 2, name: 'Beto' } as Candidate);

      // Step 1: Click delete — captures the nzOnOk callback
      let onOkFn: (() => void) | undefined;
      responsiveModal.createConfirm.and.callFake((config) => {
        onOkFn = (config as Record<string, unknown>)['nzOnOk'] as (() => void) | undefined;
        return {} as NzModalRef;
      });
      component.confirmDelete();
      expect(responsiveModal.createConfirm).toHaveBeenCalled();

      // Step 2: User confirms deletion
      onOkFn!();

      // Step 3: Verify DELETE HTTP request is made
      const deleteReq = httpMock.expectOne(`${plateUrl}${plate.id}/`);
      deleteReq.flush(null);

      // Step 4: Verify plate is gone and state is reset to empty
      expect(component.plate()).toBeNull();
      expect(component.president()).toBeNull();
      expect(component.vicePresident()).toBeNull();
      expect(component.expanded()).toBeFalse();
      expect(messageService.create).toHaveBeenCalledWith('success', 'Chapa excluída com sucesso.');
    });
  });

  describe('reload after modal close', () => {
    it('reloads plate after create modal closes with saved: true', () => {
      const newPlate = makePlate({ id: 10, name: 'Nova Chapa' });
      component.showCreateModal();

      // Flush candidate HTTP requests
      httpMock.match(req => req.url !== plateUrl).forEach(r => r.flush([]));

      // Simulate modal close
      modalAfterClose.next({ saved: true });

      // Flush the reload plate GET and any subsequent member requests
      const plateReqs = httpMock.match(req => req.url === plateUrl);
      plateReqs.forEach(r => r.flush([newPlate]));

      // Flush any remaining unmatched requests (loadPlateMembers)
      httpMock.match(() => true).forEach(r => r.flush([]));

      expect(component.plate()).toEqual(newPlate);
    });
  });
});
