import {BaseService} from "../../services/base.service";
import {Directive, InjectionToken, Injector, OnDestroy, OnInit, ViewChild} from "@angular/core";
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

    public http: HttpClient;
    public service: BaseService<T>;
    public unsubscribe = new Subject();
    public router: Router
    public formBuilder: FormBuilder;
    public formGroup: FormGroup;
    public object: T | object;
    public tableData: T[] = [];
    public rawObject: T | object;
    public activatedRoute: ActivatedRoute;
    public pageLength = 0;
    @ViewChild(NzPaginationComponent, {static: true}) paginator: NzPaginationComponent;

    public pk: string;

    protected constructor(public injector: Injector, public options: BaseOptions) {
        this.http = injector.get(HttpClient);
        this.service = injector.get(this._serviceToken());
        this.router = injector.get(Router);
        this.formBuilder = injector.get(FormBuilder);
        this.activatedRoute = injector.get(ActivatedRoute);
        this.pk = options.pk || "id";
    }

    public ngOnInit(callback?: () => void) {
        this.createFormGroup();
        if (this.paginator) {
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
        if (this.paginator) {
            this.paginator.nzPageIndex = 1;
            this.paginator.nzPageSize = 10;
            // this.paginator.pageSizeOptions = [5, 10, 25, 50];
            // this.paginator.showFirstLastButtons = true;
        }
        // this.paginator.nz
        //     .pipe(tap(() => this.search()))
        //     .subscribe();
        //
        // }
    }

    public abstract createFormGroup(): void;

    get f() {
        return this.formGroup.controls;
    }


    get v() {
        return this.formGroup.value;
    }

    // Convenience getter for easy access to form fields raw values
    get rv() {
        return this.formGroup.getRawValue();
    }

    public goToPage(route: string): void {
        const extras: NavigationExtras = {queryParamsHandling: "merge"};
        this.router.navigate([route], extras).then();
    }

    private _serviceToken(): InjectionToken<BaseService<T>> {
        return new InjectionToken<BaseService<T>>("service_" + this.options.endpoint, {
            providedIn: "root", factory: () => new BaseService<T>(this.http, this.options.endpoint),
        });
    }

    public createService<K>(model: new () => K, path: string): BaseService<K> {
        const TOKEN = new InjectionToken<BaseService<K>>("service_" + path, {
            providedIn: "root", factory: () => new BaseService<K>(this.http, path),
        });
        return this.injector.get(TOKEN);
    }

    // Save or update object
    public saveOrUpdate(callback?: (event: number) => void): void {
        this._saveOrUpdate(false, false, callback);
    }

    // Save or update object and return to save mode
    public saveOrUpdatePlus(callback?: (event: number) => void, skippCreateMode?: boolean): void {
        this._saveOrUpdate(false, true, callback, skippCreateMode);
    }

    // Save or update object as multipart/form-data
    public saveOrUpdateFormData(callback?: (event: number) => void): void {
        this._saveOrUpdate(true, false, callback);
    }

    // Save or update object as multipart/form-data and return to save mode
    public saveOrUpdateFormDataPlus(callback?: (event: number) => void): void {
        this._saveOrUpdate(true, true, callback);
    }


    private _saveOrUpdate(isFormData: boolean, isPlus: boolean, callback?: (event: number) => void, skippCreateMode?: boolean): void {

        // Get data to save or update
        let data;
        if (isFormData) {
            data = new FormData();
            Object.keys(this.rv).forEach(key => {
                const value = this.rv[key];
                data.append(key, value === null || value === undefined ? "" : value);
            });
        } else {
            Object.assign(this.object, this.rv);
            data = this.object;
        }
        // Save or update according ID
        if (this.object[this.pk]) {
            this.service.update(this.object[this.pk], data)
                .pipe(take(1))
                .subscribe(response => {
                        this.rawObject = response;
                        this._response(isPlus ? null : response, EVENT.UPDATE, callback, skippCreateMode);
                    }
                );
        } else {
            this.service.save(data)
                .pipe(take(1))
                .subscribe(response => {
                        this.rawObject = response;
                        this._response(isPlus ? null : response, EVENT.SAVE, callback, skippCreateMode);
                    }
                );
        }
    }

    private _response(response: any, event: number, callback?: (event: number) => void, skippCreateMode?: boolean) {
        if (this.options.noResponse || !([EVENT.RETRIEVE, EVENT.SAVE, EVENT.UPDATE].includes(event))) {
            handler(event, callback);
            return;
        }
        if (response) {
            this.object = response;
            if (this.formGroup) {
                this.formGroup.reset(this.object);
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
            this.object = {};
            this.createFormGroup();
            // this.requestFocus();
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
        const route = this._getPathRoute(this.router.routerState.snapshot.root)
            .map(path => path.replace(":action", this.object[this.pk]));
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

    // Recover route param
    public retrieveParam(name: string): Observable<number | string> {
        return this.activatedRoute.params.pipe(
            take(1),
            map((params: Params) => {
                const value = params[name];
                return value ? value : null;
            })
        );
    }

    // Return observable with model id to retrieve
    public beforeRetrieve(): Observable<number | string> {

        // by default the id will be captured by active route parameters
        return this.activatedRoute.params.pipe(
            take(1),
            map((params: Params) => {
                const id = params[this.options.retrieveIdRoute || "action"];
                return id && id !== "create" ? id : null;
            })
        );
    }

    // Retrieve object by id
    public retrieve(callback?: () => void): void {
        // Add parameters to filter retrieve
        if (this.options.paramsOnInit) {
            const parameters = this.options.paramsOnInit;
            Object.keys(parameters).forEach(t => this.service.addParameter(t, parameters[t]));
        }
        // Retrieve object
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
                this.object[this.pk] = id;
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
        // Store field to patch
        const patch = {};
        patch[field] = !aObject[field];

        // Update boolean field in object
        this.service.update(aObject[this.pk], patch)
            .pipe(take(1))
            .subscribe(() => {
                },
                () => {
                    aObject[field] = !aObject[field];
                }, () => {
                    handler(EVENT.TOGGLE, callback);
                }
            );
    }

    public search(callback?: (event: number) => void): void {
        this.beforeSearch()
            .subscribe(data => {
                this.tableData = data;
                handler(EVENT.SEARCH, callback);
            });
    }

    public beforeSearch(): Observable<T[]> {
        if (this.paginator) {
            this.service.addParameter("limit", this.paginator.nzPageSize);
            this.service.addParameter("offset", ((this.paginator.nzPageIndex - 1) * this.paginator.nzPageSize));

            return this.service.getPaginated(this.options.searchRoute).pipe(
                map((data: PaginatedResult<T>) => {
                    this.pageLength = data.count;
                    return data.results;
                }),
            );
        } else {
            return this.service.getAll(this.options.searchRoute).pipe(
                map((data: T[]) => {
                    this.pageLength = data.length;
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
