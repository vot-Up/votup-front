import {Routes} from '@angular/router';
import {LoginComponent} from "./components/login/login.component";
import {MainComponent} from "./components/main/main.component";
import {LoginElector} from "./components/login-elector/login-elector.component";
import {ResetPasswordComponent} from "./components/reset-password/reset-password.component";

export const ROUTES: Routes = [
    {path: 'login', component: LoginComponent},
    {path: "core", loadChildren: () => import("./core/core.module").then(m => m.CoreModule)},
    {path: "", redirectTo: "main", pathMatch: "full"},
    {path: 'main', component: MainComponent},
    {path: 'login-elector', component: LoginElector},
    {path: 'reset-password', component: ResetPasswordComponent},
];
