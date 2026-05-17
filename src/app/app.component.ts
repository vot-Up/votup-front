import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import {AuthService} from "../services/auth.service";
import {Router, RouterLink, RouterLinkActive, RouterOutlet} from "@angular/router";
import {NzButtonModule} from "ng-zorro-antd/button";
import {NzLayoutModule} from "ng-zorro-antd/layout";
import {NzMenuModule} from "ng-zorro-antd/menu";

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


    public isHiddenMenu() {
        const list = ["/main", "/login", "/login-elector", "/reset-password"]

        if (!list.includes(window.location.pathname) && !this.authService.isLoggedIn()) {
            this.router.navigate(["main"]).then();
        }

        return !list.includes(window.location.pathname)
    }

}
