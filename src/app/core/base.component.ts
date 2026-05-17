import {BaseService} from "../../services/base.service";
import {Directive, inject, OnDestroy, OnInit, signal, viewChild} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {interval, Observable, Subject, switchMap, takeWhile} from "rxjs";
import {ActivatedRoute, ActivatedRouteSnapshot, NavigationExtras, Params, Router} from "@angular/router";
import {FormBuilder, FormGroup} from "@angular/forms";
import {map, take} from "rxjs/operators";
import {PaginatedResult} from "../../dto/paginated-result";
import {NzPaginationComponent} from "ng-zorro-antd/pagination";

export const EVENT = {
  RETRIEVE: 0,
  SAVE: 1,
  UPDATE: 2,
  DELETE: 3,
  SEARCH: 4,
  TOGGLE: 5,
};

export interface BaseOptions {
  pk?: string;
  paramsOnInit?: object;
  endpoint: string;
  retrieveOnInit?: boolean;
  retrieveIdRoute?: string;
  retrieveRoute?: string;
  searchOnInit?: boolean;
  noResponse?: boolean;
  nextRoute?: string;
  nextRouteUpdate?: string;
  searchRoute?: string
}

const handler = (event: number, callback?: (event: number) => void) => {
  if (callback) {
    callback(event);
  }
};

@Directive()
export abstract class BaseComponent<T> implements OnInit, OnDestroy {
  public http = inject(HttpClient);
  public service: BaseService<T>;
  public unsubscribe = new Subject();
  public router = inject(Router);
  public formBuilder = inject(FormBuilder);
  public formGroup: FormGroup;
  public object = signal<T>({} as T);
  public tableData = signal<T[]>([]);
  public rawObject: T | object;
  public activatedRoute = inject(ActivatedRoute);
  public pageLength = signal<number>(0);
  readonly paginator = viewChild(NzPaginationComponent);
  public pk: string;

  // eslint-disable-next-line @angular-eslint/prefer-inject
  protected constructor(protected options: BaseOptions) {
    this.service = new BaseService<T>(this.http, options.endpoint);
    this.pk = options.pk || "id";
  }

  public ngOnInit(callback?: () => void) {
    this.createFormGroup();
    if (this.paginator()) {
      this._createPaginator();
    }
    if (this.options.retrieveOnInit) {
      this.retrieve(callback);
    } else {
      handler(EVENT.RETRIEVE, callback);
    }
    if (this.options.searchOnInit) {
      this.search();
    }
  }

  private _createPaginator(): void {
    const paginator = this.paginator();
    if (paginator) {
      paginator.nzPageIndex = 1;
      paginator.nzPageSize = 10;
    }
  }

  public abstract createFormGroup(): void;

  get f() { return this.formGroup.controls; }
  get v() { return this.formGroup.value; }
  get rv() { return this.formGroup.getRawValue(); }

  public goToPage(route: string): void {
    const extras: NavigationExtras = {queryParamsHandling: "merge"};
    this.router.navigate([route], extras).then();
  }

  public createService<K>(path: string): BaseService<K> {
    return new BaseService<K>(this.http, path);
  }

  public saveOrUpdate(callback?: (event: number) => void): void {
    this._saveOrUpdate(false, false, callback);
  }

  public saveOrUpdatePlus(callback?: (event: number) => void, skippCreateMode?: boolean): void {
    this._saveOrUpdate(false, true, callback, skippCreateMode);
  }

  public saveOrUpdateFormData(callback?: (event: number) => void): void {
    this._saveOrUpdate(true, false, callback);
  }

  public saveOrUpdateFormDataPlus(callback?: (event: number) => void): void {
    this._saveOrUpdate(true, true, callback);
  }

  private _saveOrUpdate(isFormData: boolean, isPlus: boolean, callback?: (event: number) => void, skippCreateMode?: boolean): void {
    let data;
    if (isFormData) {
      data = new FormData();
      Object.keys(this.rv).forEach(key => {
        const value = this.rv[key];
        data.append(key, value === null || value === undefined ? "" : value);
      });
    } else {
      const currentObj = this.object();
      Object.assign(currentObj, this.rv);
      data = currentObj;
    }
    const currentObj = this.object();
    if (currentObj[this.pk]) {
      this.service.update(currentObj[this.pk], data)
        .pipe(take(1))
        .subscribe(response => {
          this.rawObject = response;
          this._response(isPlus ? null : response, EVENT.UPDATE, callback, skippCreateMode);
        });
    } else {
      this.service.save(data)
        .pipe(take(1))
        .subscribe(response => {
          this.rawObject = response;
          this._response(isPlus ? null : response, EVENT.SAVE, callback, skippCreateMode);
        });
    }
  }

  private _response(response: T | null, event: number, callback?: (event: number) => void, skippCreateMode?: boolean) {
    if (this.options.noResponse || !([EVENT.RETRIEVE, EVENT.SAVE, EVENT.UPDATE].includes(event))) {
      handler(event, callback);
      return;
    }
    if (response) {
      this.object.set(response);
      if (this.formGroup) {
        this.formGroup.reset(response);
      }
      if (this.options.nextRouteUpdate) {
        if (event === EVENT.SAVE) {
          this._changeToUpdateMode();
        } else if (event === EVENT.UPDATE) {
          this.goToPage(this.options.nextRouteUpdate);
        }
      } else if (this.options.nextRoute) {
        if (event === EVENT.SAVE || event === EVENT.UPDATE) {
          this.goToPage(this.options.nextRoute);
        }
      }
    } else {
      this.object.set({} as T);
      this.createFormGroup();
      if (!skippCreateMode) {
        this._changeToCreateMode();
      }
    }
    handler(event, callback);
  }

  private _changeToCreateMode() {
    const route = this._getPathRoute(this.router.routerState.snapshot.root)
      .map(path => path.replace(":action", "create"));
    this.router.navigate([route.join("/")], {queryParamsHandling: "preserve"}).then();
  }

  private _changeToUpdateMode() {
    const currentObj = this.object();
    const route = this._getPathRoute(this.router.routerState.snapshot.root)
      .map(path => path.replace(":action", currentObj[this.pk]));
    this.router.navigate([route.join("/")], {queryParamsHandling: "preserve"}).then();
  }

  private _getPathRoute(route: ActivatedRouteSnapshot) {
    let array = [];
    if (route.routeConfig && route.routeConfig.path !== "") {
      array.push(route.routeConfig.path);
    }
    if (route.firstChild) {
      array = array.concat(this._getPathRoute(route.firstChild));
    }
    return array;
  }

  public retrieveParam(name: string): Observable<number | string> {
    return this.activatedRoute.params.pipe(
      take(1),
      map((params: Params) => {
        const value = params[name];
        return value ? value : null;
      })
    );
  }

  public beforeRetrieve(): Observable<number | string> {
    return this.activatedRoute.params.pipe(
      take(1),
      map((params: Params) => {
        const id = params[this.options.retrieveIdRoute || "action"];
        return id && id !== "create" ? id : null;
      })
    );
  }

  public retrieve(callback?: () => void): void {
    if (this.options.paramsOnInit) {
      const parameters = this.options.paramsOnInit;
      Object.keys(parameters).forEach(t => this.service.addParameter(t, parameters[t]));
    }
    this.beforeRetrieve().pipe(
      take(1),
      takeWhile(id => {
        if (!!id) {
          return true;
        }
        handler(EVENT.RETRIEVE, callback);
        return false;
      }),
      switchMap(id => {
        const currentObj = this.object();
        currentObj[this.pk] = id;
        this.object.set({...currentObj});
        return this.service.getById(id, this.options.retrieveRoute);
      })
    ).subscribe(response => {
      this.rawObject = response;
      this._response(response, EVENT.RETRIEVE, callback);
    });
  }

  public ngOnDestroy() {
    this.unsubscribe.next({});
    this.unsubscribe.complete();
  }

  public toggle(aObject: T, field: string, callback?: (event: number) => void): void {
    const patch = {};
    patch[field] = !aObject[field];
    this.service.update(aObject[this.pk], patch)
      .pipe(take(1))
      .subscribe(() => {
      }, () => {
        aObject[field] = !aObject[field];
      }, () => {
        handler(EVENT.TOGGLE, callback);
      });
  }

  public search(callback?: (event: number) => void): void {
    this.beforeSearch()
      .subscribe(data => {
        this.tableData.set(data);
        handler(EVENT.SEARCH, callback);
      });
  }

  public beforeSearch(): Observable<T[]> {
    const paginator = this.paginator();
    if (paginator) {
      this.service.addParameter("limit", paginator.nzPageSize);
      this.service.addParameter("offset", ((paginator.nzPageIndex - 1) * paginator.nzPageSize));
      return this.service.getPaginated(this.options.searchRoute).pipe(
        map((data: PaginatedResult<T>) => {
          this.pageLength.set(data.count);
          return data.results;
        }),
      );
    } else {
      return this.service.getAll(this.options.searchRoute).pipe(
        map((data: T[]) => {
          this.pageLength.set(data.length);
          return data;
        }),
      );
    }
  }

  public reloadPage(timeInterval: number): void {
    interval(timeInterval * 1000)
      .pipe(take(1))
      .subscribe(() => window.location.reload());
  }
}
