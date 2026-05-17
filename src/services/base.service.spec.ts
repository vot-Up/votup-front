import {TestBed} from '@angular/core/testing';
import {provideHttpClient} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';

import {BaseService} from './base.service';
import {PaginatedResult} from '../dto/paginated-result';

interface TestEntity {
  id: number;
  name: string;
  active?: boolean;
}

describe('BaseService', () => {
  let service: BaseService<TestEntity>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.runInInjectionContext(() => new BaseService<TestEntity>('/entities/'));
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.removeItem('token');
  });

  it('getAll returns Observable<T[]> with query parameters', done => {
    service.addParameter('active', true);

    service.getAll().subscribe(result => {
      expect(result).toEqual([{id: 1, name: 'Alpha', active: true}]);
      done();
    });

    const request = httpMock.expectOne(req => req.method === 'GET' && req.url === service.fullUrl);
    expect(request.request.params.get('active')).toBe('true');
    request.flush([{id: 1, name: 'Alpha', active: true}]);
  });

  it('getPaginated returns Observable<PaginatedResult<T>>', done => {
    const page: PaginatedResult<TestEntity> = {
      count: 1,
      next: null,
      previous: null,
      results: [{id: 1, name: 'Alpha'}],
    };

    service.getPaginated().subscribe(result => {
      expect(result.results[0].name).toBe('Alpha');
      done();
    });

    httpMock.expectOne(service.fullUrl).flush(page);
  });

  it('save accepts T and returns Observable<T>', done => {
    const entity: TestEntity = {id: 1, name: 'Alpha'};

    service.save(entity).subscribe(result => {
      expect(result).toEqual(entity);
      done();
    });

    const request = httpMock.expectOne(service.fullUrl);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(entity);
    request.flush(entity);
  });

  it('update accepts Partial<T> and returns Observable<T>', done => {
    const patch: Partial<TestEntity> = {name: 'Updated'};

    service.update(1, patch).subscribe(result => {
      expect(result.name).toBe('Updated');
      done();
    });

    const request = httpMock.expectOne(`${service.fullUrl}1/`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual(patch);
    request.flush({id: 1, name: 'Updated'});
  });

  it('delete returns Observable<void>', done => {
    service.delete(1).subscribe(result => {
      expect(result).toBeNull();
      done();
    });

    const request = httpMock.expectOne(`${service.fullUrl}1/`);
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
  });

  it('loadFile returns Observable<Blob>', done => {
    const blob = new Blob(['report'], {type: 'text/plain'});

    service.loadFile('export', {format: 'txt'}).subscribe(result => {
      expect(result).toEqual(blob);
      done();
    });

    const request = httpMock.expectOne(`${service.fullUrl}export/`);
    expect(request.request.method).toBe('POST');
    expect(request.request.responseType).toBe('blob');
    expect(request.request.body).toEqual({format: 'txt'});
    request.flush(blob);
  });

  it('deleteFromListRoute sends a typed body object', done => {
    service.deleteFromListRoute<{deleted: boolean}>('bulk', {id: 1}).subscribe(result => {
      expect(result.deleted).toBeTrue();
      done();
    });

    const request = httpMock.expectOne(`${service.fullUrl}bulk/`);
    expect(request.request.method).toBe('DELETE');
    expect(request.request.body).toEqual({id: 1});
    request.flush({deleted: true});
  });

  it('getChoices returns option choices from DRF metadata', done => {
    service.getChoices('status').subscribe(result => {
      expect(result).toEqual([{value: 'active', display_name: 'Active'}]);
      done();
    });

    httpMock.expectOne(service.fullUrl).flush({
      actions: {
        POST: {
          status: {
            choices: [{value: 'active', display_name: 'Active'}],
          },
        },
      },
    });
  });

  it('options returns DRF action metadata', done => {
    service.options().subscribe(result => {
      expect(result.name.choices).toEqual([{value: 1, display_name: 'One'}]);
      done();
    });

    httpMock.expectOne(service.fullUrl).flush({
      actions: {
        POST: {
          name: {
            choices: [{value: 1, display_name: 'One'}],
          },
        },
      },
    });
  });

  it('uses route-specific URLs for list and detail helpers', done => {
    let completed = 0;
    const finish = () => {
      completed += 1;
      if (completed === 8) {
        done();
      }
    };

    service.getAll('active').subscribe(result => {
      expect(result.length).toBe(1);
      finish();
    });
    httpMock.expectOne(`${service.fullUrl}active/`).flush([{id: 1, name: 'Alpha'}]);

    service.getAllFromAnotherRoute('/external/').subscribe(result => {
      expect(result[0].id).toBe(2);
      finish();
    });
    httpMock.expectOne(`${service.urlBase}/external/`).flush([{id: 2, name: 'Beta'}]);

    service.getPaginatedFromDetailRoute<TestEntity>(1, 'children').subscribe(result => {
      expect(result.count).toBe(1);
      finish();
    });
    httpMock.expectOne(`${service.fullUrl}1/children/`).flush({count: 1, next: null, previous: null, results: [{id: 3, name: 'Child'}]});

    service.getPaginatedFromListRoute<TestEntity>('search').subscribe(result => {
      expect(result.results[0].name).toBe('List');
      finish();
    });
    httpMock.expectOne(`${service.fullUrl}search/`).flush({count: 1, next: null, previous: null, results: [{id: 4, name: 'List'}]});

    service.getFromDetailRoute<TestEntity>(1, 'owner').subscribe(result => {
      expect(result.name).toBe('Owner');
      finish();
    });
    httpMock.expectOne(`${service.fullUrl}1/owner/`).flush({id: 5, name: 'Owner'});

    service.getFromListRoute<TestEntity>('current').subscribe(result => {
      expect(result.name).toBe('Current');
      finish();
    });
    httpMock.expectOne(`${service.fullUrl}current/`).flush({id: 6, name: 'Current'});

    service.getById(7, 'audit').subscribe(result => {
      expect(result.id).toBe(7);
      finish();
    });
    httpMock.expectOne(`${service.fullUrl}7/audit/`).flush({id: 7, name: 'Audited'});

    service.loadUrl('/absolute/url/').subscribe(result => {
      expect(result.name).toBe('Loaded');
      finish();
    });
    httpMock.expectOne('/absolute/url/').flush({id: 8, name: 'Loaded'});
  });

  it('posts and patches through route helper methods', done => {
    let completed = 0;
    const finish = () => {
      completed += 1;
      if (completed === 4) {
        done();
      }
    };

    service.postFromDetailRoute<Partial<TestEntity>, TestEntity>(1, 'approve', {active: true}).subscribe(result => {
      expect(result.active).toBeTrue();
      finish();
    });
    let request = httpMock.expectOne(`${service.fullUrl}1/approve/`);
    expect(request.request.method).toBe('POST');
    request.flush({id: 1, name: 'Alpha', active: true});

    service.postFromListRoute<Partial<TestEntity>, TestEntity>('bulk', {name: 'Bulk'}).subscribe(result => {
      expect(result.name).toBe('Bulk');
      finish();
    });
    request = httpMock.expectOne(`${service.fullUrl}bulk/`);
    expect(request.request.method).toBe('POST');
    request.flush({id: 2, name: 'Bulk'});

    service.patchFromDetailRoute<Partial<TestEntity>, TestEntity>(1, 'flag', {active: false}).subscribe(result => {
      expect(result.active).toBeFalse();
      finish();
    });
    request = httpMock.expectOne(`${service.fullUrl}1/flag/`);
    expect(request.request.method).toBe('PATCH');
    request.flush({id: 1, name: 'Alpha', active: false});

    service.patchFromListRoute<Partial<TestEntity>, TestEntity>('bulk', {active: true}).subscribe(result => {
      expect(result.active).toBeTrue();
      finish();
    });
    request = httpMock.expectOne(`${service.fullUrl}bulk/`);
    expect(request.request.method).toBe('PATCH');
    request.flush({id: 3, name: 'Gamma', active: true});
  });

  it('saves and updates FormData payloads', done => {
    let completed = 0;
    const finish = () => {
      completed += 1;
      if (completed === 2) {
        done();
      }
    };
    const formData = new FormData();
    formData.append('name', 'Alpha');

    service.saveWithFormData(formData).subscribe(result => {
      expect(result.id).toBe(1);
      finish();
    });
    let request = httpMock.expectOne(service.fullUrl);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toBe(formData);
    request.flush({id: 1, name: 'Alpha'});

    service.updateWithFormData(formData).subscribe(result => {
      expect(result.name).toBe('Updated');
      finish();
    });
    request = httpMock.expectOne(service.fullUrl);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toBe(formData);
    request.flush({id: 1, name: 'Updated'});
  });

  it('adds authorization headers and replaces duplicate parameters', done => {
    service.changeToken('abc');
    service.addParameter('page', 1);
    service.addParameter('page', 2);

    service.getAll().subscribe(() => done());

    const request = httpMock.expectOne(req => req.url === service.fullUrl && req.params.get('page') === '2');
    expect(request.request.headers.get('Authorization')).toBe('Bearer abc');
    expect(request.request.params.get('page')).toBe('2');
    request.flush([]);
  });

  it('uses localStorage token when no explicit token was set', done => {
    localStorage.setItem('token', 'stored-token');

    service.getAll().subscribe(() => done());

    const request = httpMock.expectOne(service.fullUrl);
    expect(request.request.headers.get('Authorization')).toBe('Bearer stored-token');
    request.flush([]);
  });

  it('returns an empty choice list when the DRF field is absent', done => {
    service.getChoices('missing').subscribe(result => {
      expect(result).toEqual([]);
      done();
    });

    httpMock.expectOne(service.fullUrl).flush({actions: {POST: {}}});
  });

  it('getFileFromListRoute returns blobs with blob responseType', done => {
    const blob = new Blob(['csv'], {type: 'text/csv'});

    service.getFileFromListRoute('download').subscribe(result => {
      expect(result).toEqual(blob);
      done();
    });

    const request = httpMock.expectOne(`${service.fullUrl}download/`);
    expect(request.request.method).toBe('GET');
    expect(request.request.responseType).toBe('blob');
    request.flush(blob);
  });

  it('returns typed fallback values for swallowed read errors', done => {
    let completed = 0;
    const finish = () => {
      completed += 1;
      if (completed === 21) {
        done();
      }
    };
    const failRequest = (url: string) => httpMock.expectOne(url).flush('error', {status: 500, statusText: 'Error'});

    service.getAll().subscribe(result => {
      expect(result).toEqual([]);
      finish();
    });
    failRequest(service.fullUrl);

    service.getAllFromAnotherRoute('/external/').subscribe(result => {
      expect(result).toEqual([]);
      finish();
    });
    failRequest(`${service.urlBase}/external/`);

    service.getPaginated().subscribe(result => {
      expect(result.count).toBe(0);
      expect(result.results).toEqual([]);
      finish();
    });
    failRequest(service.fullUrl);

    service.getPaginatedFromDetailRoute<TestEntity>(1, 'children').subscribe(result => {
      expect(result.results).toEqual([]);
      finish();
    });
    failRequest(`${service.fullUrl}1/children/`);

    service.getPaginatedFromListRoute<TestEntity>('search').subscribe(result => {
      expect(result.results).toEqual([]);
      finish();
    });
    failRequest(`${service.fullUrl}search/`);

    service.getFromDetailRoute<TestEntity>(1, 'owner').subscribe(result => {
      expect(result).toBeUndefined();
      finish();
    });
    failRequest(`${service.fullUrl}1/owner/`);

    service.getFromListRoute<TestEntity>('current').subscribe(result => {
      expect(result).toBeUndefined();
      finish();
    });
    failRequest(`${service.fullUrl}current/`);

    service.postFromDetailRoute<Partial<TestEntity>, TestEntity>(1, 'approve', {active: true}).subscribe(result => {
      expect(result).toBeUndefined();
      finish();
    });
    failRequest(`${service.fullUrl}1/approve/`);

    service.postFromListRoute<Partial<TestEntity>, TestEntity>('bulk', {name: 'Bulk'}).subscribe(result => {
      expect(result).toBeUndefined();
      finish();
    });
    failRequest(`${service.fullUrl}bulk/`);

    service.deleteFromListRoute<TestEntity>('bulk', {id: 1}).subscribe(result => {
      expect(result).toBeUndefined();
      finish();
    });
    failRequest(`${service.fullUrl}bulk/`);

    service.patchFromDetailRoute<Partial<TestEntity>, TestEntity>(1, 'flag', {active: false}).subscribe(result => {
      expect(result).toBeUndefined();
      finish();
    });
    failRequest(`${service.fullUrl}1/flag/`);

    service.patchFromListRoute<Partial<TestEntity>, TestEntity>('bulk', {active: true}).subscribe(result => {
      expect(result).toBeUndefined();
      finish();
    });
    failRequest(`${service.fullUrl}bulk/`);

    service.save({id: 1, name: 'Alpha'}).subscribe(result => {
      expect(result).toBeUndefined();
      finish();
    });
    failRequest(service.fullUrl);

    service.saveWithFormData(new FormData()).subscribe(result => {
      expect(result).toBeUndefined();
      finish();
    });
    failRequest(service.fullUrl);

    service.updateWithFormData(new FormData()).subscribe(result => {
      expect(result).toBeUndefined();
      finish();
    });
    failRequest(service.fullUrl);

    service.getById(1).subscribe(result => {
      expect(result).toBeUndefined();
      finish();
    });
    failRequest(`${service.fullUrl}1/`);

    service.delete(1).subscribe(result => {
      expect(result).toBeUndefined();
      finish();
    });
    failRequest(`${service.fullUrl}1/`);

    service.update(1, {name: 'Bad'}).subscribe({
      error: error => {
        expect(error.status).toBe(500);
        finish();
      },
    });
    failRequest(`${service.fullUrl}1/`);

    service.options().subscribe(result => {
      expect(result).toEqual({});
      finish();
    });
    failRequest(service.fullUrl);

    service.getChoices('status').subscribe(result => {
      expect(result).toEqual([]);
      finish();
    });
    failRequest(service.fullUrl);

    service.loadUrl('/absolute/url/').subscribe(result => {
      expect(result).toBeUndefined();
      finish();
    });
    failRequest('/absolute/url/');
  });
});
