import {Routes} from '@angular/router';
import {LoginComponent} from "./components/login/login.component";
import {MainComponent} from "./components/main/main.component";
import {LoginElectorComponent} from "./components/login-elector/login-elector.component";
import {ResetPasswordComponent} from "./components/reset-password/reset-password.component";
import {authGuard} from "./app/auth.guard";
import {SwiperPrototypeComponent} from "./shared/swiper-prototype/swiper-prototype.component";

export const ROUTES: Routes = [
  {path: 'login', component: LoginComponent},
  {path: "core", canActivate: [authGuard], loadChildren: () => import("./core/core.routes").then(m => m.ROUTES)},
  {path: "", redirectTo: "main", pathMatch: "full"},
  {path: 'main', component: MainComponent},
  {path: 'login-elector', component: LoginElectorComponent},
  {path: 'reset-password', component: ResetPasswordComponent},
  {path: 'swiper-demo', component: SwiperPrototypeComponent},
];
