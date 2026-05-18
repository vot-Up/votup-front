import { Injectable, inject } from "@angular/core";
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
  email: string;
  role: 'ELEITOR' | 'CANDIDATO' | null;
  user: User;
  exp: number;
  orig_iat: number;
}

@Injectable()
export class AuthService {
  http = inject(HttpClient);
  router = inject(Router);
  variables = inject(AppVariables);
  private storage = localStorage;
  private readonly urlBase: string;
  private urlToken: string;

  constructor() {
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

  get role(): 'ELEITOR' | 'CANDIDATO' | null {
    const token = this.storage.getItem("token");
    if (!token) {
      return null;
    }
    const payload = <AuthPayload>jwtDecode(token);
    return payload.role ?? null;
  }

  get isAdmin(): boolean {
    const token = this.storage.getItem("token");
    if (!token) {
      return false;
    }
    const payload = <AuthPayload>jwtDecode(token);
    return payload.user?.is_staff === true;
  }

  public login(email: string, password: string) {
    const payload = {"email": email, "password": password};
    return this.http.post(this.urlToken, payload)
      .pipe(
        tap((response: AuthResponse) => this.setToken(response)),
        shareReplay(),
      );
  }

  public setToken(response: AuthResponse) {
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
    this.variables.user = undefined;
    if (reload) {
      location.reload();
    }
    if (redirect) {
      this.router.navigate(["main"]).then();
    }
  }

  public navigateByRole(): void {
    if (this.isAdmin) {
      this.router.navigate(["/core/vote"]).then();
    } else if (this.role === 'CANDIDATO') {
      this.router.navigate(["/candidate/plates"]).then();
    } else {
      this.router.navigate(["/login-elector"]).then();
    }
  }
}
