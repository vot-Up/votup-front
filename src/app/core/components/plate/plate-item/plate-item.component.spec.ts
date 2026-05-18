import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, Params, provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject, Subject } from 'rxjs';
import { NZ_MODAL_DATA, NzModalService, ModalButtonOptions } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';

import { PlateItemComponent } from './plate-item.component';
import { Candidate } from '../../../../../models/core/candidate';
import { Plate } from '../../../../../models/core/plate';

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
    cellphone: '92999999999',
    last_login: new Date(),
    is_superuser: false,
    is_staff: false,
    avatar: null,
    file_name: '',
    disabled: false,
    ...overrides,
});

const plate = (overrides: Partial<Plate> = {}): Plate => ({
    id: 10,
    url: '/api/votup/plate/10/',
    created_at: new Date(),
    modified_at: new Date(),
    active: true,
    name: 'Chapa Mobile',
    plate: [],
    was_voted: false,
    is_linked: false,
    ...overrides,
});

const flushIconRequests = (httpMock: HttpTestingController): void => {
    httpMock.match(req => req.url.startsWith('assets/')).forEach(request => {
        request.flush('<svg></svg>');
    });
};

describe('PlateItemComponent', () => {
    let fixture: ComponentFixture<PlateItemComponent>;
    let component: PlateItemComponent;
    let httpMock: HttpTestingController;
    let breakpointState: Subject<BreakpointState>;
    let modal: jasmine.SpyObj<NzModalService>;
    let modalRef: { close: jasmine.Spy };
    let messageService: jasmine.SpyObj<NzMessageService>;
    let modalData: unknown;

    const createComponent = async (data: unknown = null): Promise<void> => {
        modalData = data;
        routeParams.next({});
        breakpointState = new Subject<BreakpointState>();
        modal = jasmine.createSpyObj<NzModalService>('NzModalService', ['create', 'confirm', 'closeAll']);
        modalRef = { close: jasmine.createSpy('close') };
        modal.create.and.returnValue(modalRef as never);
        modal.confirm.and.returnValue(modalRef as never);
        messageService = jasmine.createSpyObj<NzMessageService>('NzMessageService', ['create']);

        await TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, PlateItemComponent],
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
                    provide: BreakpointObserver,
                    useValue: {
                        observe: () => breakpointState.asObservable(),
                    },
                },
                { provide: NZ_MODAL_DATA, useFactory: () => modalData },
                { provide: NzModalService, useValue: modal },
                { provide: NzMessageService, useValue: messageService },
            ],
        }).compileComponents();

        httpMock = TestBed.inject(HttpTestingController);
        fixture = TestBed.createComponent(PlateItemComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        flushIconRequests(httpMock);
    };

    const setMobile = (matches: boolean): void => {
        breakpointState.next({ matches, breakpoints: { '(max-width: 767px)': matches } });
        fixture.detectChanges();
        flushIconRequests(httpMock);
    };

    const openAssignments = (matches: boolean): void => {
        component.object.set(plate());
        component.hide.set(false);
        component.candidates.set([
            candidate({ id: 1, name: 'Ana Candidata', url: '/api/votup/candidate/1/' }),
            candidate({ id: 2, name: 'Bruno Candidato', url: '/api/votup/candidate/2/' }),
        ]);
        setMobile(matches);
    };

    afterEach(() => {
        flushIconRequests(httpMock);
        httpMock.verify();
        TestBed.resetTestingModule();
    });

    it('updates the isMobile signal from the <768px breakpoint', async () => {
        await createComponent();

        setMobile(true);
        expect(component.isMobile()).toBeTrue();

        setMobile(false);
        expect(component.isMobile()).toBeFalse();
    });

    it('loads existing plate assignments from modal data on init', async () => {
        const existingPlate = plate({ id: 12, name: 'Chapa Existente', url: '/api/votup/plate/12/' });

        await createComponent({ pk: 12, plate: existingPlate });

        const requests = httpMock.match(req => req.method === 'GET' && req.url === component.candidateService.fullUrl);
        expect(requests.length).toBe(3);
        expect(requests[0].request.params.get('plate_president')).toBe('12');
        expect(requests[1].request.params.get('plate_vice')).toBe('12');
        expect(requests[2].request.params.get('exists')).toBe('12');

        requests[0].flush([candidate({ id: 3, name: 'Presidente' })]);
        requests[1].flush([candidate({ id: 4, name: 'Vice' })]);
        requests[2].flush([candidate({ id: 5, name: 'Disponivel' })]);

        expect(component.object()).toBe(existingPlate);
        expect(component.hide()).toBeFalse();
        expect(component.presidents()[0].name).toBe('Presidente');
        expect(component.vice_presidents()[0].name).toBe('Vice');
        expect(component.candidates()[0].name).toBe('Disponivel');
    });

    it('renders tap-to-select mobile mode without desktop drop lists', async () => {
        await createComponent();
        openAssignments(true);

        expect(fixture.nativeElement.querySelector('[data-testid="plate-mobile-assignment"]')).not.toBeNull();
        expect(fixture.nativeElement.querySelector('[data-testid="plate-desktop-assignment"]')).toBeNull();
        expect(fixture.nativeElement.querySelector('.candidate-tap-item')).not.toBeNull();
    });

    it('renders desktop drag-and-drop mode when breakpoint is not mobile', async () => {
        await createComponent();
        openAssignments(false);

        expect(fixture.nativeElement.querySelector('[data-testid="plate-desktop-assignment"]')).not.toBeNull();
        expect(fixture.nativeElement.querySelector('[data-testid="plate-mobile-assignment"]')).toBeNull();
        expect(fixture.nativeElement.querySelector('[cdkDropList]')).not.toBeNull();
    });

    it('opens an action-sheet-style modal with president and vice options for an available candidate', async () => {
        await createComponent();
        openAssignments(true);

        component.openCandidateActions(component.candidates()[0]);

        expect(modal.create).toHaveBeenCalledWith(jasmine.objectContaining({
            nzTitle: 'Ana Candidata',
            nzClassName: 'plate-action-sheet-modal',
            nzZIndex: 1100,
        }));
        const footer = modal.create.calls.mostRecent().args[0].nzFooter as ModalButtonOptions[];
        expect(footer.map(button => button.label)).toEqual([
            'Assignar como Presidente',
            'Assignar como Vice-Presidente',
            'Cancelar',
        ]);
    });

    it('executes action-sheet option callbacks and closes only the action sheet', async () => {
        await createComponent();
        openAssignments(true);
        const selected = component.candidates()[1];

        component.openCandidateActions(selected);
        const footer = modal.create.calls.mostRecent().args[0].nzFooter as ModalButtonOptions[];
        footer[1].onClick?.();

        const request = httpMock.expectOne(component.plateUserService.fullUrl);
        expect(request.request.method).toBe('POST');
        expect(request.request.body).toEqual(jasmine.objectContaining({
            candidate: '/api/votup/candidate/2/',
            type: 'V',
        }));
        request.flush({});

        footer[2].onClick?.();
        expect(modalRef.close).toHaveBeenCalled();
        expect(modal.closeAll).not.toHaveBeenCalled();
    });

    it('assigns an available candidate as president and persists through plate_user', async () => {
        await createComponent();
        openAssignments(true);
        const selected = component.candidates()[0];

        component.assignCandidateToRole(selected, 'P');

        const request = httpMock.expectOne(component.plateUserService.fullUrl);
        expect(request.request.method).toBe('POST');
        expect(request.request.body).toEqual(jasmine.objectContaining({
            plate: '/api/votup/plate/10/',
            candidate: '/api/votup/candidate/1/',
            type: 'P',
        }));
        request.flush({});

        expect(component.presidents()).toEqual([selected]);
        expect(component.candidates().some(item => item.id === selected.id)).toBeFalse();
    });

    it('disables the president option when the president slot is already filled', async () => {
        await createComponent();
        openAssignments(true);
        component.presidents.set([candidate({ id: 8, name: 'Presidente Atual' })]);

        component.openCandidateActions(component.candidates()[0]);

        const footer = modal.create.calls.mostRecent().args[0].nzFooter as ModalButtonOptions[];
        expect(footer[0].label).toBe('Assignar como Presidente');
        expect((footer[0].disabled as () => boolean)()).toBeTrue();
        expect((footer[1].disabled as () => boolean)()).toBeFalse();
    });

    it('shows Remover for an assigned candidate and removes it back to available candidates', async () => {
        await createComponent();
        openAssignments(true);
        const selected = candidate({ id: 7, name: 'Presidente Atual', url: '/api/votup/candidate/7/' });
        component.presidents.set([selected]);
        component.candidates.set([]);

        component.openCandidateActions(selected, 'P');
        expect(modal.confirm).toHaveBeenCalledWith(jasmine.objectContaining({
            nzTitle: 'Presidente Atual',
            nzOkText: 'Remover',
            nzCancelText: 'Cancelar',
        }));

        component.removeCandidateFromRole(selected, 'P');

        const request = httpMock.expectOne(`${component.plateUserService.fullUrl}delete_user_plate/`);
        expect(request.request.method).toBe('DELETE');
        expect(request.request.body).toEqual(jasmine.objectContaining({
            plate: 10,
            candidate: 7,
        }));
        request.flush({});

        expect(component.presidents()).toEqual([]);
        expect(component.candidates()[0]).toBe(selected);
    });

    it('executes the Remover action from the confirm dialog', async () => {
        await createComponent();
        openAssignments(true);
        const selected = candidate({ id: 9, name: 'Vice Atual', url: '/api/votup/candidate/9/' });
        component.vice_presidents.set([selected]);

        component.openCandidateActions(selected, 'V');
        const onOk = modal.confirm.calls.mostRecent().args[0].nzOnOk as () => void;
        onOk();

        const request = httpMock.expectOne(`${component.plateUserService.fullUrl}delete_user_plate/`);
        expect(request.request.method).toBe('DELETE');
        request.flush({});

        expect(component.vice_presidents()).toEqual([]);
        expect(modal.confirm).toHaveBeenCalled();
    });

    it('warns and does not persist when assigning to a filled slot or moving an assigned candidate directly', async () => {
        await createComponent();
        openAssignments(true);
        const selected = component.candidates()[0];
        component.presidents.set([candidate({ id: 20, name: 'Presidente Atual' })]);

        component.assignCandidateToRole(selected, 'P');

        expect(messageService.create).toHaveBeenCalledWith('warning', 'Essa chapa já contém um Presidente');
        expect(httpMock.match(component.plateUserService.fullUrl).length).toBe(0);

        component.presidents.set([]);
        component.vice_presidents.set([selected]);
        component.assignCandidateToRole(selected, 'P');

        expect(messageService.create).toHaveBeenCalledWith('warning', 'É necessário remover o usuário da função atual antes disso!');
        expect(httpMock.match(component.plateUserService.fullUrl).length).toBe(0);
    });

    it('preserves form validation and save logic for creating a plate before assignment', async () => {
        await createComponent();
        component.formGroup.patchValue({ name: 'Nova Chapa' });

        component.savePlate(true);

        const saveRequest = httpMock.expectOne(component.service.fullUrl);
        expect(saveRequest.request.method).toBe('POST');
        expect(saveRequest.request.body).toEqual(jasmine.objectContaining({ name: 'Nova Chapa' }));
        saveRequest.flush(plate({ id: 22, name: 'Nova Chapa', url: '/api/votup/plate/22/' }));

        const candidatesRequest = httpMock.expectOne(req => req.method === 'GET' && req.url === component.candidateService.fullUrl);
        expect(candidatesRequest.request.params.get('active')).toBe('true');
        expect(candidatesRequest.request.params.get('exists')).toBe('22');
        candidatesRequest.flush([]);

        expect(component.hide()).toBeFalse();
        expect(messageService.create).toHaveBeenCalledWith('success', 'Chapa criada, associe o presidente e o vice-presidente');
    });

    it('keeps desktop drag-and-drop transfer behavior unchanged', async () => {
        await createComponent();
        openAssignments(false);
        const selected = component.candidates()[0];
        const event = {
            previousContainer: { id: 'U', data: component.candidates() },
            container: { id: 'P', data: component.presidents() },
            previousIndex: 0,
            currentIndex: 0,
        } as CdkDragDrop<Candidate[]>;

        component.dropItem(event);

        const request = httpMock.expectOne(component.plateUserService.fullUrl);
        expect(request.request.method).toBe('POST');
        expect(request.request.body).toEqual(jasmine.objectContaining({
            plate: '/api/votup/plate/10/',
            candidate: selected.url,
            type: 'P',
        }));
        request.flush({});

        expect(component.presidents()[0]).toBe(selected);
        expect(component.candidates().some(item => item.id === selected.id)).toBeFalse();
    });

    it('keeps desktop drag removal back to available candidates unchanged', async () => {
        await createComponent();
        openAssignments(false);
        const selected = component.candidates()[0];
        component.candidates.set([]);
        component.presidents.set([selected]);
        const event = {
            previousContainer: { id: 'P', data: component.presidents() },
            container: { id: 'U', data: component.candidates() },
            previousIndex: 0,
            currentIndex: 0,
        } as CdkDragDrop<Candidate[]>;

        component.dropItem(event);

        const request = httpMock.expectOne(`${component.plateUserService.fullUrl}delete_user_plate/`);
        expect(request.request.method).toBe('DELETE');
        expect(request.request.body).toEqual(jasmine.objectContaining({
            plate: 10,
            candidate: selected.id,
        }));
        request.flush({});

        expect(component.candidates()[0]).toBe(selected);
        expect(component.presidents()).toEqual([]);
    });

    it('keeps desktop drag guard messages for occupied and cross-role drops', async () => {
        await createComponent();
        openAssignments(false);
        const first = component.candidates()[0];
        const second = component.candidates()[1];
        component.presidents.set([first]);
        component.vice_presidents.set([second]);

        component.dropItem({
            previousContainer: { id: 'U', data: component.candidates() },
            container: { id: 'P', data: component.presidents() },
            previousIndex: 0,
            currentIndex: 0,
        } as CdkDragDrop<Candidate[]>);

        expect(messageService.create).toHaveBeenCalledWith('warning', 'Essa chapa já contém um Presidente');

        component.dropItem({
            previousContainer: { id: 'P', data: component.presidents() },
            container: { id: 'V', data: component.vice_presidents() },
            previousIndex: 0,
            currentIndex: 0,
        } as CdkDragDrop<Candidate[]>);

        expect(messageService.create).toHaveBeenCalledWith(
            'warning',
            'É necessário remover o usuário da função Presidente antes disso!'
        );
        expect(httpMock.match(component.plateUserService.fullUrl).length).toBe(0);
    });

    it('adds the search term when loading available candidates', async () => {
        await createComponent();
        component.object.set(plate());
        component.searchUser.set('Ana');

        component.getCandidates();

        const request = httpMock.expectOne(req => req.method === 'GET' && req.url === component.candidateService.fullUrl);
        expect(request.request.params.get('active')).toBe('true');
        expect(request.request.params.get('exists')).toBe('10');
        expect(request.request.params.get('name')).toBe('Ana');
        request.flush([candidate({ name: 'Ana' })]);

        expect(component.candidates()[0].name).toBe('Ana');
    });

    it('updates an existing plate and closes when requested', async () => {
        await createComponent();
        component.object.set(plate());
        component.formGroup.patchValue({ name: 'Chapa Atualizada' });

        component.savePlate(true);

        const request = httpMock.expectOne(`${component.service.fullUrl}10/`);
        expect(request.request.method).toBe('PATCH');
        expect(request.request.body).toEqual(jasmine.objectContaining({ name: 'Chapa Atualizada' }));
        request.flush(plate({ name: 'Chapa Atualizada' }));

        expect(messageService.create).toHaveBeenCalledWith('success', 'A chapa foi atualizada com sucesso!');
        expect(modal.closeAll).toHaveBeenCalled();
    });

    it('closes the modal through the explicit close action', async () => {
        await createComponent();

        component.close();

        expect(modal.closeAll).toHaveBeenCalled();
    });

    it('prevents horizontal overflow on the 375px mobile surface', async () => {
        await createComponent();
        openAssignments(true);
        const host = fixture.nativeElement as HTMLElement;
        host.style.width = '375px';
        fixture.detectChanges();

        expect(host.querySelector('.mobile-assignment')).not.toBeNull();
        expect(host.scrollWidth).toBeLessThanOrEqual(host.clientWidth || host.scrollWidth);
    });
});
