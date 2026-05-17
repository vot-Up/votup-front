import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {inject, Injectable} from "@angular/core";
import {catchError, map, Observable, of, throwError} from "rxjs";
import {PaginatedResult} from "../dto/paginated-result";
import {environment} from "../environments/environment";

export type HttpParameterValue = string | number | boolean;

export interface HttpRequestOptions {
  headers?: HttpHeaders;
  params?: HttpParams;
  responseType?: 'json';
}

interface HttpBlobRequestOptions extends Omit<HttpRequestOptions, 'responseType'> {
  responseType: 'blob';
}

/** DRF OPTIONS response shape */
interface OptionsResponse {
  actions: {
    POST: Record<string, ActionFieldMetadata>;
  };
}

export interface ActionFieldMetadata {
  choices?: ChoiceItem[];
  [key: string]: unknown;
}

export interface ChoiceItem {
  value: HttpParameterValue;
  display_name: string;
}

@Injectable({providedIn: 'root'})
export class BaseService<T> {
  private readonly http: HttpClient;

  public readonly urlBase: string;
  public readonly fullUrl: string;
  public readonly path: string;
  private parameters: HttpParams = new HttpParams();
  private token: string | null = null;

  constructor(path: string, http = inject(HttpClient)) {
    this.http = http;
    this.path = path;
    this.urlBase = environment.urlBase;
    this.fullUrl = `${this.urlBase}${path}`;
  }

  public clearParameter(): void {
    this.parameters = new HttpParams();
    this.token = null;
  }

  public addParameter(key: string, value: HttpParameterValue): void {
    if (this.parameters.has(key)) {
      this.parameters = this.parameters.set(key, value);
    } else {
      this.parameters = this.parameters.append(key, value);
    }
  }

  public changeToken(token: string): void {
    this.token = token;
  }

  private getOptions(): HttpRequestOptions;
  private getOptions(responseType: 'blob'): HttpBlobRequestOptions;
  private getOptions(responseType?: 'blob'): HttpRequestOptions | HttpBlobRequestOptions {
    const token = this.token ? this.token : localStorage.getItem("token");
    const httpOptions: HttpRequestOptions | HttpBlobRequestOptions = responseType === 'blob'
      ? {responseType: 'blob'}
      : {};
    if (token) {
      httpOptions.headers = new HttpHeaders({"Authorization": "Bearer ".concat(token)});
    }
    if (this.parameters) {
      httpOptions.params = this.parameters;
    }
    return httpOptions;
  }

  public getAll(route?: string): Observable<T[]> {
    const url = route ? `${this.fullUrl}${route}/` : `${this.fullUrl}`;
    return this.http.get<T[]>(url, this.getOptions())
      .pipe(catchError(() => of([] as T[])));
  }

  public getAllFromAnotherRoute(route?: string): Observable<T[]> {
    const url = route ? `${this.urlBase}${route}` : `${this.fullUrl}`;
    return this.http.get<T[]>(url, this.getOptions())
      .pipe(catchError(() => of([] as T[])));
  }

  public getPaginated(route?: string): Observable<PaginatedResult<T>> {
    const url = route ? `${this.fullUrl}${route}/` : `${this.fullUrl}`;
    return this.http.get<PaginatedResult<T>>(url, this.getOptions())
      .pipe(catchError(() => of({count: 0, next: null, previous: null, results: []} as PaginatedResult<T>)));
  }

  public getPaginatedFromDetailRoute<K>(id: number, route: string): Observable<PaginatedResult<K>> {
    const url = `${this.fullUrl}${id}/${route}/`;
    return this.http.get<PaginatedResult<K>>(url, this.getOptions())
      .pipe(catchError(() => of({count: 0, next: null, previous: null, results: []} as PaginatedResult<K>)));
  }

  public getPaginatedFromListRoute<K>(route: string): Observable<PaginatedResult<K>> {
    const url = `${this.fullUrl}${route}/`;
    return this.http.get<PaginatedResult<K>>(url, this.getOptions())
      .pipe(catchError(() => of({count: 0, next: null, previous: null, results: []} as PaginatedResult<K>)));
  }

  public getFromDetailRoute<K>(id: number, route: string): Observable<K> {
    const url = `${this.fullUrl}${id}/${route}/`;
    return this.http.get<K>(url, this.getOptions())
      .pipe(catchError(() => of(undefined as unknown as K)));
  }

  public getFromListRoute<K>(route: string): Observable<K> {
    const url = `${this.fullUrl}${route}/`;
    return this.http.get<K>(url, this.getOptions())
      .pipe(catchError(() => of(undefined as unknown as K)));
  }

  public postFromDetailRoute<E, K>(id: number, route: string, entity: E): Observable<K> {
    const url = `${this.fullUrl}${id}/${route}/`;
    return this.http.post<K>(url, entity, this.getOptions())
      .pipe(catchError(() => of(undefined as unknown as K)));
  }

  public postFromListRoute<E, K>(route: string, entity: E): Observable<K> {
    const url = `${this.fullUrl}${route}/`;
    return this.http.post<K>(url, entity, this.getOptions())
      .pipe(catchError(() => of(undefined as unknown as K)));
  }

  public deleteFromListRoute<K, M extends object = Record<string, unknown>>(route: string, model: M): Observable<K> {
    const url = `${this.fullUrl}${route}/`;
    const token = this.token ? this.token : localStorage.getItem('token');
    const httpOptions: HttpRequestOptions & { body?: M } = {};
    if (token) {
      httpOptions.headers = new HttpHeaders({"Authorization": "Bearer ".concat(token)});
    }
    if (model) {
      httpOptions.body = model;
    }
    return this.http.delete<K>(url, httpOptions)
      .pipe(catchError(() => of(undefined as unknown as K)));
  }

  public patchFromDetailRoute<E, K>(id: number, route: string, entity: E): Observable<K> {
    const url = `${this.fullUrl}${id}/${route}/`;
    return this.http.patch<K>(url, entity, this.getOptions())
      .pipe(catchError(() => of(undefined as unknown as K)));
  }

  public patchFromListRoute<E, K>(route: string, entity: E): Observable<K> {
    const url = `${this.fullUrl}${route}/`;
    return this.http.patch<K>(url, entity, this.getOptions())
      .pipe(catchError(() => of(undefined as unknown as K)));
  }

  public save(entity: T): Observable<T> {
    this.clearParameter();
    return this.http.post<T>(this.fullUrl, entity, this.getOptions())
      .pipe(catchError(() => of(undefined as unknown as T)));
  }

  public saveWithFormData(entity: FormData): Observable<T> {
    this.clearParameter();
    return this.http.post<T>(this.fullUrl, entity, this.getOptions())
      .pipe(catchError(() => of(undefined as unknown as T)));
  }

  public updateWithFormData(entity: FormData): Observable<T> {
    this.clearParameter();
    return this.http.patch<T>(this.fullUrl, entity, this.getOptions())
      .pipe(catchError(() => of(undefined as unknown as T)));
  }

  public getById(id: number | string, route?: string): Observable<T> {
    const url = route ? `${this.fullUrl}${id}/${route}/` : `${this.fullUrl}${id}/`;
    return this.http.get<T>(url, this.getOptions())
      .pipe(catchError(() => of(undefined as unknown as T)));
  }

  public delete(id: number | string): Observable<void> {
    this.clearParameter();
    const url = `${this.fullUrl}${id}/`;
    return this.http.delete<void>(url, this.getOptions())
      .pipe(catchError(() => of(undefined as unknown as void)));
  }

  public update(id: number | string, entity: Partial<T>): Observable<T> {
    this.clearParameter();
    const url = `${this.fullUrl}${id}/`;
    return this.http.patch<T>(url, entity, this.getOptions())
      .pipe(catchError(err => throwError(() => err)));
  }

  public options(): Observable<Record<string, ActionFieldMetadata>> {
    return this.http.options<OptionsResponse>(this.fullUrl, this.getOptions())
      .pipe(
        map(response => response.actions.POST),
        catchError(() => of({} as Record<string, ActionFieldMetadata>))
      );
  }

  public getChoices(field: string): Observable<ChoiceItem[]> {
    return this.http.options<OptionsResponse>(this.fullUrl, this.getOptions())
      .pipe(
        map(response => response.actions.POST[field]?.choices ?? []),
        catchError(() => of([] as ChoiceItem[]))
      );
  }

  public loadUrl(url: string): Observable<T> {
    return this.http.get<T>(url, this.getOptions())
      .pipe(catchError(() => of(undefined as unknown as T)));
  }

  public loadFile(route: string, data: Record<string, unknown>): Observable<Blob> {
    const url = `${this.fullUrl}${route}/`;
    return this.http.post(url, data, this.getOptions('blob'));
  }

  public getFileFromListRoute(route: string): Observable<Blob> {
    const url = `${this.fullUrl}${route}/`;
    return this.http.get(url, this.getOptions('blob'));
  }
}
