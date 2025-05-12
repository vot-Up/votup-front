import {NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {DatePipe, registerLocaleData} from '@angular/common';
import {en_US, NZ_I18N} from 'ng-zorro-antd/i18n';
import pt from '@angular/common/locales/pt-PT';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NzLayoutModule} from "ng-zorro-antd/layout";
import {NzMenuModule} from "ng-zorro-antd/menu";
import {NzBreadCrumbModule} from "ng-zorro-antd/breadcrumb";
import {NzGridModule} from "ng-zorro-antd/grid";
import {NzButtonModule} from "ng-zorro-antd/button";
import {NzIconModule} from "ng-zorro-antd/icon";
import {NzTableModule} from "ng-zorro-antd/table";
import {NzDividerModule} from "ng-zorro-antd/divider";
import {NzToolTipModule} from "ng-zorro-antd/tooltip";
import {NzInputModule} from "ng-zorro-antd/input";
import {NzFormModule} from "ng-zorro-antd/form";
import {NzDatePickerComponent, NzDatePickerModule} from "ng-zorro-antd/date-picker";
import {NzSelectModule} from "ng-zorro-antd/select";
import {NzSwitchModule} from "ng-zorro-antd/switch";
import {NzSpaceModule} from "ng-zorro-antd/space";
import {NzModalModule} from "ng-zorro-antd/modal";
import {DragDropModule} from "@angular/cdk/drag-drop";
import {LoginComponent} from './components/login/login.component';
import {NzTypographyModule} from "ng-zorro-antd/typography";
import {RouterModule} from "@angular/router";
import {ROUTES} from "./app-routing.module";
import {AppVariables} from "./app/app.variables";
import {AppGuard} from "./app/app.guard";
import {AuthService} from "../services/auth.service";
import {NzAlertModule} from "ng-zorro-antd/alert";
import {NzMessageService} from "ng-zorro-antd/message";
import {MainComponent} from './components/main/main.component';
import {CellphoneFormatePipe} from "../utilities/validator/cellphone-formate.pipe";
import {UserService} from "../services/user.service";
import {AuthInterceptor} from "../utilities/validator/auth.interceptor";
import {LoginElector} from "./components/login-elector/login-elector.component";
import {CoreModule} from "./core/core.module";
import {NgxMaskDirective, NgxMaskPipe, provideNgxMask} from "ngx-mask";
import {SharedModule} from "./shared/shared.module";
import {ResetPasswordComponent} from './components/reset-password/reset-password.component';
import { VoterComponent } from './core/components/voter/voter.component';
import { CandidateComponent } from './core/components/candidate/candidate.component';
import {NzPaginationModule} from "ng-zorro-antd/pagination";


registerLocaleData(pt);

@NgModule({
    declarations: [
        AppComponent,
        LoginComponent,
        MainComponent,
        LoginElector,
        CellphoneFormatePipe,
        ResetPasswordComponent,
        VoterComponent,
        CandidateComponent
    ],
    imports: [
        FormsModule,
        HttpClientModule,
        BrowserAnimationsModule,
        NzLayoutModule,
        NzMenuModule,
        NzBreadCrumbModule,
        NzGridModule,
        NzButtonModule,
        NzIconModule,
        NzTableModule,
        NzDividerModule,
        NzToolTipModule,
        NzInputModule,
        NzFormModule,
        NzDatePickerModule,
        NzSelectModule,
        NzSwitchModule,
        NzSpaceModule,
        NzModalModule,
        DragDropModule,
        ReactiveFormsModule,
        NzTypographyModule,
        RouterModule.forRoot(ROUTES),
        NzAlertModule,
        CoreModule,
        NgxMaskDirective,
        NgxMaskPipe,
        SharedModule,
        NzPaginationModule,
    ],
    exports: [
        CellphoneFormatePipe
    ],
    providers: [
        {provide: NZ_I18N, useValue: en_US},
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true
        },
        AppVariables,
        AppGuard,
        AuthService,
        NzMessageService,
        NzDatePickerComponent,
        DatePipe,
        UserService,
        NzMessageService,
        provideNgxMask()
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
