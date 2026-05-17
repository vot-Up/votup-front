import { Component, ChangeDetectionStrategy, computed, inject, signal } from '@angular/core';
import {AuthService} from "../services/auth.service";
import {NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet} from "@angular/router";
import {NzButtonModule} from "ng-zorro-antd/button";
import {NzLayoutModule} from "ng-zorro-antd/layout";
import {NzMenuModule} from "ng-zorro-antd/menu";
import {filter} from "rxjs/operators";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.less'],
    imports: [NzLayoutModule, NzMenuModule, RouterLink, RouterLinkActive, NzButtonModule, RouterOutlet]
})
export class AppComponent {
    authService = inject(AuthService);
    router = inject(Router);

    private readonly publicRoutes = ["/main", "/login", "/login-elector", "/reset-password"];
    private readonly currentPath = signal(window.location.pathname);

    public readonly hiddenMenu = computed(() => {
        const path = this.currentPath();

        if (!this.publicRoutes.includes(path) && !this.authService.isLoggedIn()) {
            this.router.navigate(["main"]).then();
        }

        return !this.publicRoutes.includes(path);
    });

    constructor() {
        this.router.events
            .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
            .subscribe(event => this.currentPath.set(event.urlAfterRedirects.split('?')[0]));
    }

}
