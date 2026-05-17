import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, Params, provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject } from 'rxjs';
import { provideEnvironmentNgxMask } from 'ngx-mask';
import { NZ_MODAL_DATA, NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';

import { VoterItemComponent } from './voter-item.component';
import { Voter } from '../../../../../models/core/voter';

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
    cellphone: '92999999999',
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

class MockFileReader {
    public onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => unknown) | null = null;
    public result: string | ArrayBuffer | null = 'data:image/png;base64,ZmFrZQ==';

    public readAsDataURL = jasmine.createSpy('readAsDataURL').and.callFake(() => {
        window.setTimeout(() => {
            this.onload?.call(this as unknown as FileReader, new ProgressEvent('load'));
        }, 0);
    });
}

describe('VoterItemComponent', () => {
    let fixture: ComponentFixture<VoterItemComponent>;
    let component: VoterItemComponent;
    let httpMock: HttpTestingController;
    let modal: jasmine.SpyObj<NzModalService>;
    let messageService: jasmine.SpyObj<NzMessageService>;
    let modalData: unknown;

    const createComponent = async (data: unknown = {}): Promise<void> => {
        modalData = data;
        routeParams.next({});
        modal = jasmine.createSpyObj<NzModalService>('NzModalService', ['closeAll']);
        messageService = jasmine.createSpyObj<NzMessageService>('NzMessageService', ['create']);

        await TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, VoterItemComponent],
            providers: [
                provideRouter([]),
                provideHttpClient(),
                provideHttpClientTesting(),
                provideEnvironmentNgxMask(),
                {
                    provide: ActivatedRoute,
                    useValue: {
                        params: routeParams.asObservable(),
                    },
                },
                { provide: NZ_MODAL_DATA, useFactory: () => modalData },
                { provide: NzModalService, useValue: modal },
                { provide: NzMessageService, useValue: messageService },
            ],
        }).compileComponents();

        httpMock = TestBed.inject(HttpTestingController);
        fixture = TestBed.createComponent(VoterItemComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        flushIconRequests(httpMock);
    };

    afterEach(() => {
        flushIconRequests(httpMock);
        httpMock.verify();
        TestBed.resetTestingModule();
    });

    it('keeps the form valid with name and cellphone filled', async () => {
        await createComponent();

        component.formGroup.patchValue({name: 'Maria Silva', cellphone: '92999999999'});

        expect(component.formGroup.valid).toBeTrue();
    });

    it('keeps the form invalid with empty name', async () => {
        await createComponent();

        component.formGroup.patchValue({name: '', cellphone: '92999999999'});
        component.f.name.markAsTouched();
        component.f.name.markAsDirty();
        component.f.name.updateValueAndValidity();
        fixture.detectChanges();

        expect(component.formGroup.valid).toBeFalse();
        expect(component.f.name.invalid).toBeTrue();
    });

    it('keeps the form invalid with empty cellphone', async () => {
        await createComponent();

        component.formGroup.patchValue({name: 'Maria Silva', cellphone: ''});
        component.f.cellphone.markAsTouched();
        component.f.cellphone.markAsDirty();
        component.f.cellphone.updateValueAndValidity();
        fixture.detectChanges();

        expect(component.formGroup.valid).toBeFalse();
        expect(component.f.cellphone.invalid).toBeTrue();
    });

    it('updates the avatar preview signal when a valid image is selected', async () => {
        await createComponent();
        const file = new File(['avatar'], 'avatar.png', {type: 'image/png'});
        const fileReaderSpy = spyOn(window as typeof window & { FileReader: typeof FileReader }, 'FileReader')
            .and.returnValue(new MockFileReader() as unknown as FileReader);

        component.changeFile({target: {files: [file]}} as unknown as Event);
        await new Promise(resolve => window.setTimeout(resolve, 0));

        expect(fileReaderSpy).toHaveBeenCalled();
        expect(component.f.avatar.value).toBe(file);
        expect(String(component.avatar())).toContain('data:image/png;base64');
        expect(component.hasImage()).toBeTrue();
    });

    it('ignores unsupported avatar file types', async () => {
        await createComponent();
        const file = new File(['avatar'], 'avatar.gif', {type: 'image/gif'});

        component.changeFile({target: {files: [file]}} as unknown as Event);

        expect(component.f.avatar.value ?? null).toBeNull();
        expect(component.avatar() ?? null).toBeNull();
        expect(component.hasImage()).toBeFalse();
    });

    it('clears the avatar preview, control, and native file input', async () => {
        await createComponent();
        const input = document.createElement('input');
        input.type = 'file';
        component.avatar.set('data:image/png;base64,abc');
        component.f.avatar.setValue(new File(['avatar'], 'avatar.png', {type: 'image/png'}));

        component.clearFile(input);

        expect(component.avatar()).toBeNull();
        expect(component.f.avatar.value).toBeNull();
        expect(input.value).toBe('');
    });

    it('converts a base64 avatar string into an image data url', async () => {
        await createComponent();

        component.convertToImage('abc123');

        expect(component.avatar()).toBe('data:image/jpg;base64,abc123');
    });

    it('loads the existing avatar into the avatar control when object data has an image', async () => {
        await createComponent();
        component.object.set(voter({avatar: 'YWJj'}));

        component.loadFile();

        expect(String(component.avatar())).toContain('data:image');
        expect(component.f.avatar.value instanceof Blob).toBeTrue();
    });

    it('loads voters through search into the local items signal', async () => {
        await createComponent();

        component.search();

        const request = httpMock.expectOne(component.service.fullUrl);
        expect(request.request.method).toBe('GET');
        request.flush([voter({id: 5})]);

        expect(component.items().length).toBe(1);
        expect(component.items()[0].id).toBe(5);
    });

    it('creates a voter with FormData when there is no existing id', async () => {
        await createComponent();
        component.formGroup.patchValue({name: 'Maria Silva', cellphone: '92999999999'});

        component.saveOrUpdate();

        const request = httpMock.expectOne(component.service.fullUrl);
        expect(request.request.method).toBe('POST');
        expect(request.request.body instanceof FormData).toBeTrue();
        expect(request.request.body.get('name')).toBe('Maria Silva');
        expect(request.request.body.get('cellphone')).toBe('92999999999');
        request.flush(voter({id: 22}));

        expect(messageService.create).toHaveBeenCalledWith('success', 'Eleitor criado com sucesso');
        expect(modal.closeAll).toHaveBeenCalled();
    });

    it('updates a voter with FormData when the existing object has an id', async () => {
        await createComponent({pk: 7, voter: voter({id: 7, name: 'Ana Souza'}), isUpdate: true});

        const retrieveRequest = httpMock.expectOne(`${component.service.fullUrl}7/`);
        expect(retrieveRequest.request.method).toBe('GET');
        retrieveRequest.flush(voter({id: 7, name: 'Ana Souza'}));

        component.formGroup.patchValue({name: 'Ana Lima', cellphone: '92988887777'});
        component.object.set(voter({id: 7, name: 'Ana Souza'}));

        component.saveOrUpdate();

        const request = httpMock.expectOne(`${component.service.fullUrl}7/`);
        expect(request.request.method).toBe('PATCH');
        expect(request.request.body instanceof FormData).toBeTrue();
        expect(request.request.body.get('name')).toBe('Ana Lima');
        request.flush(voter({id: 7, name: 'Ana Lima'}));

        expect(modal.closeAll).toHaveBeenCalled();
    });

    it('removes unchanged existing avatar from update FormData', async () => {
        await createComponent({pk: 8, voter: voter({id: 8, avatar: 'YWJj'}), isUpdate: true});

        const retrieveRequest = httpMock.expectOne(`${component.service.fullUrl}8/`);
        retrieveRequest.flush(voter({id: 8, avatar: 'YWJj'}));

        component.formGroup.patchValue({name: 'Maria Silva', cellphone: '92999999999'});
        component.object.set(voter({id: 8, avatar: 'YWJj'}));

        component.saveOrUpdate();

        const request = httpMock.expectOne(`${component.service.fullUrl}8/`);
        expect(request.request.method).toBe('PATCH');
        expect((request.request.body as FormData).has('avatar')).toBeFalse();
        request.flush(voter({id: 8, avatar: 'YWJj'}));
    });

    it('renders create and edit mobile sheet form surfaces without horizontal label layout', async () => {
        await createComponent({voter: voter({id: 3, name: 'Preenchida'}), isUpdate: true});

        const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
        const footer = fixture.nativeElement.querySelector('.sheet-footer') as HTMLElement;
        const avatarArea = fixture.nativeElement.querySelector('.avatar-uploader') as HTMLElement;
        const fileInput = fixture.nativeElement.querySelector('.avatar-file-input') as HTMLInputElement;

        expect(form.getAttribute('nzlayout')).toBe('vertical');
        expect(fixture.nativeElement.querySelector('[nzsm]')).toBeNull();
        expect(fixture.nativeElement.querySelector('[nzxs]')).toBeNull();
        expect(footer).not.toBeNull();
        expect(avatarArea).not.toBeNull();
        expect(fileInput).not.toBeNull();
        expect(fileInput.hasAttribute('hidden')).toBeFalse();
        expect((fixture.nativeElement.querySelector('#name') as HTMLInputElement).value).toBe('Preenchida');
    });

    it('keeps the mobile footer sticky and avatar preview larger than 80px at 375px', async () => {
        await createComponent();
        const host = fixture.nativeElement as HTMLElement;
        host.style.width = '375px';
        fixture.detectChanges();

        const footer = host.querySelector('.sheet-footer') as HTMLElement;
        const avatarPreview = host.querySelector('.avatar-preview') as HTMLElement;
        const footerStyle = getComputedStyle(footer);
        const avatarStyle = getComputedStyle(avatarPreview);

        expect(footerStyle.position).toBe('sticky');
        expect(parseFloat(avatarStyle.width)).toBeGreaterThanOrEqual(80);
        expect(host.querySelector('.avatar-file-input[hidden]')).toBeNull();
    });

    it('opens the native picker when the visible avatar action is tapped', async () => {
        await createComponent();
        const fileInput = fixture.nativeElement.querySelector('.avatar-file-input') as HTMLInputElement;
        spyOn(fileInput, 'click');

        const newPhotoButton = Array.from(fixture.nativeElement.querySelectorAll('button'))
            .find((button: Element) => button.textContent?.includes('Nova foto')) as HTMLButtonElement;
        newPhotoButton.click();

        expect(fileInput.click).toHaveBeenCalled();
    });

    it('scrolls a focused input into view so the sticky save action remains reachable', async () => {
        await createComponent();
        jasmine.clock().install();
        const input = fixture.nativeElement.querySelector('#cell') as HTMLInputElement;
        spyOn(input, 'scrollIntoView');

        component.scrollFocusedControlIntoView({target: input} as unknown as FocusEvent);
        jasmine.clock().tick(80);

        expect(input.scrollIntoView).toHaveBeenCalledWith({block: 'center', inline: 'nearest'});
        jasmine.clock().uninstall();
    });

    it('does not scroll non-control focus targets into view', async () => {
        await createComponent();
        jasmine.clock().install();
        const target = document.createElement('div');
        spyOn(target, 'scrollIntoView');

        component.scrollFocusedControlIntoView({target} as unknown as FocusEvent);
        jasmine.clock().tick(80);

        expect(target.scrollIntoView).not.toHaveBeenCalled();
        jasmine.clock().uninstall();
    });

    it('closes the sheet on cancel and emits the validation message text on error', async () => {
        await createComponent();

        component.cancel();
        component.message('error');

        expect(modal.closeAll).toHaveBeenCalled();
        expect(messageService.create).toHaveBeenCalledWith('error', 'Favor preencher o campo.');
    });
});
