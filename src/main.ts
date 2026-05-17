import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideNgxMask } from 'ngx-mask';

import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n';
import { authInterceptorFn } from './utilities/validator/auth.interceptor';
import { AppVariables } from './app/app/app.variables';
import { AppGuard } from './app/app/app.guard';
import { AuthService } from './services/auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzDatePickerComponent } from 'ng-zorro-antd/date-picker';
import { DatePipe } from '@angular/common';
import { UserService } from './services/user.service';

import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzCommentModule } from 'ng-zorro-antd/comment';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';

import { ROUTES } from './app/app.routes';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(ROUTES, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptorFn])),
    provideAnimations(),
    provideNgxMask(),
    importProvidersFrom(
      FormsModule,
      ReactiveFormsModule,
      NzLayoutModule,
      NzMenuModule,
      NzBreadCrumbModule,
      NzGridModule,
      NzButtonModule,
      NzIconModule,
      NzTableModule,
      NzDividerModule,
      NzTooltipModule,
      NzInputModule,
      NzFormModule,
      NzSelectModule,
      NzSwitchModule,
      NzSpaceModule,
      NzModalModule,
      DragDropModule,
      NzTypographyModule,
      NzAlertModule,
      NzPaginationModule,
      NzAvatarModule,
      NzUploadModule,
      NzCardModule,
      NzInputNumberModule,
      NzRadioModule,
      NzCommentModule,
      NzListModule,
      NzCollapseModule,
      NzDatePickerModule,
      NgxMaskDirective,
      NgxMaskPipe
    ),
    { provide: NZ_I18N, useValue: en_US },
    AppVariables,
    AppGuard,
    AuthService,
    NzMessageService,
    NzDatePickerComponent,
    DatePipe,
    UserService,
  ]
}).catch(err => console.error(err));
