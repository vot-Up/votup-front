import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideHttpClient} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {ActivatedRoute, convertToParamMap, ParamMap, Params, provideRouter} from '@angular/router';
import {FormGroup} from '@angular/forms';
import {BehaviorSubject} from 'rxjs';

import {BaseComponent, EVENT} from './base.component';
import {BaseService} from '../../services/base.service';

interface TestEntity {
  id?: number | string;
  name?: string;
  active?: boolean;
}

const paramsSubject = new BehaviorSubject<Params>({});
const paramMapSubject = new BehaviorSubject<ParamMap>(convertToParamMap({}));

@Component({
  selector: 'app-host-crud',
  template: '',
})
class HostCrudComponent extends BaseComponent<TestEntity> {
  constructor() {
    super({endpoint: '/entities/'});
  }

  createFormGroup(): void {
    this.formGroup = this.formBuilder.group({
      id: [null],
      name: [null],
      active: [false],
    });
  }
}

@Component({
  selector: 'app-host-retrieve',
  template: '',
})
class HostRetrieveComponent extends BaseComponent<TestEntity> {
  constructor() {
    super({endpoint: '/entities/', retrieveOnInit: true});
  }

  createFormGroup(): void {
    this.formGroup = this.formBuilder.group({
      id: [null],
      name: [null],
    });
  }
}

describe('BaseComponent', () => {
  let fixture: ComponentFixture<HostCrudComponent>;
  let component: HostCrudComponent;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    paramsSubject.next({});
    paramMapSubject.next(convertToParamMap({}));

    await TestBed.configureTestingModule({
      imports: [HostCrudComponent, HostRetrieveComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            params: paramsSubject.asObservable(),
            paramMap: paramMapSubject.asObservable(),
          },
        },
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(HostCrudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('creates a form group via injected FormBuilder', () => {
    expect(component.formGroup instanceof FormGroup).toBeTrue();
    expect(component.formGroup.contains('name')).toBeTrue();
  });

  it('exposes object as a writable signal', () => {
    component.object.set({id: 1, name: 'Alpha'});

    expect(component.object()).toEqual({id: 1, name: 'Alpha'});
  });

  it('updates tableData and pageLength signals after search', done => {
    component.search(event => {
      expect(event).toBe(EVENT.SEARCH);
      expect(component.tableData()).toEqual([{id: 1, name: 'Alpha'}]);
      expect(component.pageLength()).toBe(1);
      done();
    });

    const request = httpMock.expectOne(component.service.fullUrl);
    expect(request.request.method).toBe('GET');
    request.flush([{id: 1, name: 'Alpha'}]);
  });

  it('saveOrUpdate updates an existing signal object', done => {
    component.object.set({id: 1, name: 'Alpha', active: true});
    component.formGroup.patchValue({id: 1, name: 'Beta'});

    component.saveOrUpdate(event => {
      expect(event).toBe(EVENT.UPDATE);
      expect(component.object().name).toBe('Beta');
      done();
    });

    const request = httpMock.expectOne(`${component.service.fullUrl}1/`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body.name).toBe('Beta');
    request.flush({id: 1, name: 'Beta', active: true});
  });

  it('retrieve loads data into the object signal from route params', done => {
    paramsSubject.next({action: 7});
    paramMapSubject.next(convertToParamMap({action: 7}));
    const retrieveFixture = TestBed.createComponent(HostRetrieveComponent);
    const retrieveComponent = retrieveFixture.componentInstance;

    retrieveFixture.detectChanges();

    const request = httpMock.expectOne(`${retrieveComponent.service.fullUrl}7/`);
    expect(request.request.method).toBe('GET');
    request.flush({id: 7, name: 'Loaded'});

    setTimeout(() => {
      expect(retrieveComponent.object()).toEqual({id: 7, name: 'Loaded'});
      done();
    });
  });

  it('createService replacement creates a typed BaseService for another endpoint', () => {
    const otherService = component.createService<{code: string}>('/other/');

    expect(otherService instanceof BaseService).toBeTrue();
    expect(otherService.fullUrl).toContain('/other/');
  });

  it('exposes form control, value, and raw value helpers', () => {
    component.formGroup.patchValue({id: 3, name: 'Helpers'});

    expect(component.f['name'].value).toBe('Helpers');
    expect(component.v.name).toBe('Helpers');
    expect(component.rv.id).toBe(3);
  });

  it('saveOrUpdate creates a new entity when the signal object has no id', done => {
    component.object.set({});
    component.formGroup.patchValue({name: 'Created', active: true});

    component.saveOrUpdate(event => {
      expect(event).toBe(EVENT.SAVE);
      expect(component.object()).toEqual({id: 10, name: 'Created', active: true});
      done();
    });

    const request = httpMock.expectOne(component.service.fullUrl);
    expect(request.request.method).toBe('POST');
    expect(request.request.body.name).toBe('Created');
    request.flush({id: 10, name: 'Created', active: true});
  });

  it('saveOrUpdateFormData submits FormData payloads', done => {
    component.object.set({});
    component.formGroup.patchValue({name: 'Upload', active: true});

    component.saveOrUpdateFormData(event => {
      expect(event).toBe(EVENT.SAVE);
      expect(component.object()).toEqual({id: 11, name: 'Upload'});
      done();
    });

    const request = httpMock.expectOne(component.service.fullUrl);
    expect(request.request.method).toBe('POST');
    expect(request.request.body instanceof FormData).toBeTrue();
    expect(request.request.body.get('name')).toBe('Upload');
    request.flush({id: 11, name: 'Upload'});
  });

  it('retrieveParam emits a named route parameter', done => {
    paramsSubject.next({custom: 'abc'});

    component.retrieveParam('custom').subscribe(value => {
      expect(value).toBe('abc');
      done();
    });
  });

  it('toggle patches a boolean field and emits the toggle event', done => {
    const row: TestEntity = {id: 1, active: false};

    component.toggle(row, 'active', event => {
      expect(event).toBe(EVENT.TOGGLE);
      done();
    });

    const request = httpMock.expectOne(`${component.service.fullUrl}1/`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({active: true});
    request.flush({id: 1, active: true});
  });

  it('completes unsubscribe on destroy', () => {
    component.ngOnDestroy();

    expect(component.unsubscribe.isStopped).toBeTrue();
  });
});
