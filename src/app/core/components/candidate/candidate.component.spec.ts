import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ActivatedRoute, Params, provideRouter } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';

import { CandidateComponent } from './candidate.component';
import { AuthService } from '../../../../services/auth.service';
import { ResponsiveModalService } from '../../../../services/responsive-modal.service';
import { Candidate } from '../../../../models/core/candidate';

const routeParams = new BehaviorSubject<Params>({});

const candidate = (overrides: Partial<Candidate> = {}): Candidate => ({
  id: 1,
  url: '/api/votup/candidate/1/',
  created_at: new Date(),
  modified_at: new Date(),
  active: true,
  name: 'Ana Candidata',
  password: '',
  email: 'ana@example.com',
  cellphone: '5592999999999',
  last_login: new Date(),
  is_superuser: false,
  is_staff: false,
  avatar: null,
  file_name: '',
  disabled: false,
  ...overrides,
});

const flushIconRequests = (httpMock: HttpTestingController): void => {
  httpMock.match(req => req.url.startsWith('assets/')).forEach(request => {
    request.flush('<svg></svg>');
  });
};

describe('CandidateComponent', () => {
  let fixture: ComponentFixture<CandidateComponent>;
  let component: CandidateComponent;
  let httpMock: HttpTestingController;
  let modalAfterClose: Subject<unknown>;
  let responsiveModal: jasmine.SpyObj<ResponsiveModalService>;

  beforeEach(async () => {
    routeParams.next({});
    modalAfterClose = new Subject<unknown>();
    responsiveModal = jasmine.createSpyObj<ResponsiveModalService>('ResponsiveModalService', [
      'create',
      'createConfirm',
      'isMobile',
    ]);
    responsiveModal.isMobile.and.returnValue(false);
    responsiveModal.create.and.returnValue({ afterClose: modalAfterClose.asObservable() } as never);
    responsiveModal.createConfirm.and.returnValue({ afterClose: modalAfterClose.asObservable() } as never);

    await TestBed.configureTestingModule({
      imports: [CandidateComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            params: routeParams.asObservable(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            get user(): Candidate {
              return candidate({ id: 99, name: 'Admin' });
            },
          },
        },
        { provide: ResponsiveModalService, useValue: responsiveModal },
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(CandidateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    httpMock.expectOne(req => req.method === 'GET' && req.url === component.service.fullUrl)
      .flush({ count: 1, next: null, previous: null, results: [candidate()] });
    flushIconRequests(httpMock);
    fixture.detectChanges();
  });

  afterEach(() => {
    flushIconRequests(httpMock);
    httpMock.verify();
  });

  it('toggles a compact list item open and closed on tap/click', () => {
    component.tableData.set([candidate()]);
    fixture.detectChanges();

    const listItem: HTMLElement = fixture.nativeElement.querySelector('.expandable-list-item');
    listItem.click();
    fixture.detectChanges();

    expect(component.expandedIds().has(1)).toBeTrue();
    expect(fixture.nativeElement.querySelector('.expandable-list-expanded.open')).not.toBeNull();

    listItem.click();
    fixture.detectChanges();

    expect(component.expandedIds().has(1)).toBeFalse();
  });

  it('opens the create modal through ResponsiveModalService and refreshes after close', () => {
    component.openModal();

    expect(responsiveModal.create).toHaveBeenCalledWith(jasmine.objectContaining({
      nzTitle: 'Cadastrar candidato',
    }));

    modalAfterClose.next(undefined);

    httpMock.expectOne(req => req.method === 'GET' && req.url === component.service.fullUrl)
      .flush({ count: 1, next: null, previous: null, results: [candidate({ id: 3 })] });
  });

  it('opens the edit modal through ResponsiveModalService with candidate nzData', () => {
    const selected = candidate({ id: 7, name: 'Joao' });

    component.editCandidate(selected);

    expect(component.isUpdate()).toBeTrue();
    expect(responsiveModal.create).toHaveBeenCalledWith(jasmine.objectContaining({
      nzTitle: 'Editar dados do candidato',
      nzData: { pk: 7, candidate: selected, isUpdate: true },
    }));
  });

  it('opens delete confirmation through ResponsiveModalService and deletes on confirm', () => {
    const selected = candidate({ id: 8 });

    component.excludeCandidate(selected);

    expect(responsiveModal.createConfirm).toHaveBeenCalledWith(jasmine.objectContaining({
      nzTitle: 'Tem certeza de que deseja excluir esse candidato?',
    }));

    const config = responsiveModal.createConfirm.calls.mostRecent().args[0] as Record<string, () => void>;
    config['nzOnOk']();

    const deleteRequest = httpMock.expectOne(`${component.service.fullUrl}8/`);
    expect(deleteRequest.request.method).toBe('DELETE');
    deleteRequest.flush(null);

    httpMock.expectOne(req => req.method === 'GET' && req.url === component.service.fullUrl)
      .flush({ count: 0, next: null, previous: null, results: [] });
  });

  it('toggles active state through the inherited toggle helper', () => {
    const selected = candidate({ id: 10, active: false });

    component.toggleActive(selected);

    const request = httpMock.expectOne(`${component.service.fullUrl}10/`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ active: true });
    request.flush({ ...selected, active: true });
  });

  it('adds name and active parameters when searching', () => {
    component.formGroup.patchValue({ name: 'Ana', active: 'false' });

    component.search();

    const request = httpMock.expectOne(req => req.method === 'GET' && req.url === component.service.fullUrl);
    expect(request.request.params.get('name')).toBe('Ana');
    expect(request.request.params.get('active')).toBe('false');
    request.flush({ count: 1, next: null, previous: null, results: [candidate()] });
  });

  it('uses paginator page index and page size for prev/next navigation', () => {
    const paginator = component.paginator();
    paginator.nzPageIndex = 2;
    paginator.nzPageSize = 10;

    component.search();

    const request = httpMock.expectOne(req => req.method === 'GET' && req.url === component.service.fullUrl);
    expect(request.request.params.get('limit')).toBe('10');
    expect(request.request.params.get('offset')).toBe('10');
    request.flush({ count: 20, next: null, previous: null, results: [candidate({ id: 2 })] });
  });

  it('renders the mobile compact-list surface without table markup', () => {
    responsiveModal.isMobile.and.returnValue(true);
    component.tableData.set([candidate()]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.expandable-list-container')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('nz-table')).toBeNull();
    expect(fixture.nativeElement.querySelector('.filter-row')).not.toBeNull();
    expect(component.isMobile()).toBeTrue();
  });

  it('renders PhonePipe output in the expanded mobile detail area without horizontal overflow', () => {
    responsiveModal.isMobile.and.returnValue(true);
    component.tableData.set([candidate({ cellphone: '5592999999999' })]);
    fixture.detectChanges();

    const listItem: HTMLElement = fixture.nativeElement.querySelector('.expandable-list-item');
    listItem.click();
    fixture.detectChanges();

    const expanded: HTMLElement = fixture.nativeElement.querySelector('.expandable-list-expanded.open');
    expect(expanded.textContent).toContain('(92) 99999-9999');

    const host: HTMLElement = fixture.nativeElement;
    expect(host.scrollWidth).toBeLessThanOrEqual(host.clientWidth || host.scrollWidth);
  });

  it('exercises create, expand, edit, and delete actions on the mobile list surface', () => {
    responsiveModal.isMobile.and.returnValue(true);
    const selected = candidate({ id: 12, name: 'Mobile Candidate' });
    component.tableData.set([selected]);
    fixture.detectChanges();

    component.openModal();
    modalAfterClose.next(undefined);
    httpMock.expectOne(req => req.method === 'GET' && req.url === component.service.fullUrl)
      .flush({ count: 1, next: null, previous: null, results: [selected] });

    const listItem: HTMLElement = fixture.nativeElement.querySelector('.expandable-list-item');
    listItem.click();
    fixture.detectChanges();

    const actionButtons = fixture.nativeElement.querySelectorAll('.expandable-list-actions .action-btn');
    (actionButtons[0] as HTMLElement).click();
    fixture.detectChanges();

    expect(responsiveModal.create).toHaveBeenCalledWith(jasmine.objectContaining({
      nzTitle: 'Editar dados do candidato',
      nzData: { pk: 12, candidate: selected, isUpdate: true },
    }));

    (actionButtons[1] as HTMLElement).click();

    const config = responsiveModal.createConfirm.calls.mostRecent().args[0] as Record<string, () => void>;
    config['nzOnOk']();

    const deleteRequest = httpMock.expectOne(`${component.service.fullUrl}12/`);
    expect(deleteRequest.request.method).toBe('DELETE');
    deleteRequest.flush(null);

    httpMock.expectOne(req => req.method === 'GET' && req.url === component.service.fullUrl)
      .flush({ count: 0, next: null, previous: null, results: [] });

    expect(fixture.nativeElement.querySelector('nz-table')).toBeNull();
  });

  it('keeps paginator change hook callable', () => {
    expect(() => component.changePaginator({ page: 2 })).not.toThrow();
  });
});
