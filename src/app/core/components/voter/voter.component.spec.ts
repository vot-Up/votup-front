import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ActivatedRoute, Params, provideRouter } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';

import { VoterComponent } from './voter.component';
import { AuthService } from '../../../../services/auth.service';
import { ResponsiveModalService } from '../../../../services/responsive-modal.service';
import { Voter } from '../../../../models/core/voter';

const routeParams = new BehaviorSubject<Params>({});

const voter = (overrides: Partial<Voter> = {}): Voter => ({
  id: 1,
  url: '/api/votup/voter/1/',
  created_at: new Date(),
  modified_at: new Date(),
  active: true,
  name: 'Maria Silva',
  password: '',
  email: 'maria@example.com',
  cellphone: '5592999999999',
  last_login: new Date(),
  is_superuser: false,
  is_staff: false,
  avatar: null,
  file_name: '',
  ...overrides,
});

const flushIconRequests = (httpMock: HttpTestingController): void => {
  httpMock.match(req => req.url.startsWith('assets/')).forEach(request => {
    request.flush('<svg></svg>');
  });
};

describe('VoterComponent', () => {
  let fixture: ComponentFixture<VoterComponent>;
  let component: VoterComponent;
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
      imports: [VoterComponent],
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
            get user(): Voter {
              return voter({ id: 99, name: 'Admin' });
            },
          },
        },
        { provide: ResponsiveModalService, useValue: responsiveModal },
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(VoterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    httpMock.expectOne(req => req.method === 'GET' && req.url === component.service.fullUrl)
      .flush({ count: 1, next: null, previous: null, results: [voter()] });
    flushIconRequests(httpMock);
    fixture.detectChanges();
  });

  afterEach(() => {
    flushIconRequests(httpMock);
    httpMock.verify();
  });

  it('toggles a compact list item open and closed on tap/click', () => {
    component.tableData.set([voter()]);
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

  it('opens the edit modal through ResponsiveModalService with the voter nzData', () => {
    const selected = voter({ id: 7, name: 'Joao' });

    component.editElector(selected);

    expect(responsiveModal.create).toHaveBeenCalledWith(jasmine.objectContaining({
      nzTitle: 'Editar dados do eleitor',
      nzData: { pk: 7, voter: selected, isUpdate: true },
    }));
  });

  it('opens the create modal and refreshes the list after the modal closes', () => {
    component.openModal();

    expect(responsiveModal.create).toHaveBeenCalledWith(jasmine.objectContaining({
      nzTitle: 'Cadastrar eleitor',
    }));

    modalAfterClose.next(undefined);

    httpMock.expectOne(req => req.method === 'GET' && req.url === component.service.fullUrl)
      .flush({ count: 1, next: null, previous: null, results: [voter({ id: 3 })] });
  });

  it('opens delete confirmation through ResponsiveModalService and deletes on confirm', () => {
    const selected = voter({ id: 8 });

    component.excludeElector(selected);

    expect(responsiveModal.createConfirm).toHaveBeenCalledWith(jasmine.objectContaining({
      nzTitle: 'Tem certeza de que deseja excluir esse eleitor?',
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
    const selected = voter({ id: 10, active: false });

    component.toggleActive(selected);

    const request = httpMock.expectOne(`${component.service.fullUrl}10/`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ active: true });
    request.flush({ ...selected, active: true });
  });

  it('adds name and active parameters when searching', () => {
    component.formGroup.patchValue({ name: 'Maria', active: 'false' });

    component.search();

    const request = httpMock.expectOne(req => req.method === 'GET' && req.url === component.service.fullUrl);
    expect(request.request.params.get('name')).toBe('Maria');
    expect(request.request.params.get('active')).toBe('false');
    request.flush({ count: 1, next: null, previous: null, results: [voter()] });
  });

  it('uses paginator page index and page size for prev/next navigation', () => {
    const paginator = component.paginator();
    paginator.nzPageIndex = 2;
    paginator.nzPageSize = 10;

    component.search();

    const request = httpMock.expectOne(req => req.method === 'GET' && req.url === component.service.fullUrl);
    expect(request.request.params.get('limit')).toBe('10');
    expect(request.request.params.get('offset')).toBe('10');
    request.flush({ count: 20, next: null, previous: null, results: [voter({ id: 2 })] });
  });

  it('renders the mobile compact-list surface without table markup', () => {
    responsiveModal.isMobile.and.returnValue(true);
    component.tableData.set([voter()]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.expandable-list-container')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('nz-table')).toBeNull();
    expect(fixture.nativeElement.querySelector('.filter-row')).not.toBeNull();
    expect(component.isMobile()).toBeTrue();
  });

  it('keeps paginator change hook callable', () => {
    spyOn(console, 'log');

    component.changePaginator({ page: 2 });

    expect(console.log).toHaveBeenCalledWith({ page: 2 });
  });
});
