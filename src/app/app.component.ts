import {Component} from '@angular/core';
import {AuthService} from "../services/auth.service";
import {Router} from "@angular/router";

@Component({
  standalone: false,
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.less']
})
export class AppComponent {
    constructor(public authService: AuthService,
                public router: Router,) {
    }

    public isHiddenMenu() {
        const list = ["/main", "/login", "/login-elector", "/reset-password"]

        if (!list.includes(window.location.pathname) && !this.authService.isLoggedIn()) {
            this.router.navigate(["main"]).then();
        }

        return !list.includes(window.location.pathname)
    }

}
