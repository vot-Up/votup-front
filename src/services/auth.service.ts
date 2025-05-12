import {Injectable} from "@angular/core";
import { HttpClient } from "@angular/common/http";
import {shareReplay, tap} from "rxjs/operators";
import {Router} from "@angular/router";
import {environment} from "../environments/environment";
import {URLS} from "../app/app/app.urls";
import {AuthResponse} from "../dto/auth-response";
import {User} from "../models/core/user";
import {AppVariables} from "../app/app/app.variables";
import jwtDecode from "jwt-decode";

interface AuthPayload {
    user_id: number;
    username: string;
    user: User;
    exp: number;
    orig_iat: number;
}

@Injectable()
export class AuthService {

    private storage = localStorage;
    private readonly urlBase: string;
    private urlToken: string;

    constructor(public http: HttpClient,
                public router: Router,
                public variables: AppVariables,
    ) {
        this.urlBase = environment.urlBase;
        this.urlToken = `${this.urlBase}${URLS.TOKEN}`;
    }

    get user(): User {
        if (!this.variables.user) {
            const token = this.storage.getItem("token");
            const payload = <AuthPayload>jwtDecode(token);
            const user = payload.user;
            user.url = this.urlBase.concat(user.url);
            this.variables.user = user;
        }
        return this.variables.user;
    }

    public login(email: string, password: string) {
        const payload = {"email": email, "password": password};
        return this.http.post(this.urlToken, payload)
            .pipe(
                tap((response: AuthResponse) => this.setToken(response)),
                shareReplay(),
            );
    }

    private setToken(response: AuthResponse) {
        if (response) {
            this.storage.setItem("token", response.token.access);
            // this.user;
        }
    }

    public isLoggedIn() {
        return !!this.storage.getItem("token");
    }

    public logout(reload?: boolean, redirect?: boolean): void {
        this.storage.removeItem("token");
        this.storage.removeItem("avatar");
        if (reload) {
            location.reload();
        }
        if (redirect) {
            this.router.navigate(["main"]).then();
        }
    }
}
