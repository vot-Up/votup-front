import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ROUTES} from './core-routing.module';
import {VoteComponent} from "./components/vote/vote.component";
import {VoteItemComponent} from "./components/vote/vote-item/vote-item.component";
import {UsersComponent} from "./components/users/users.component";
import {PlateComponent} from "./components/plate/plate.component";
import {NzSelectModule} from "ng-zorro-antd/select";
import {NzFormModule} from "ng-zorro-antd/form";
import {NzIconModule} from "ng-zorro-antd/icon";
import {NzButtonModule} from "ng-zorro-antd/button";
import {NzTableModule} from "ng-zorro-antd/table";
import {NzSwitchModule} from "ng-zorro-antd/switch";
import {NzSpaceModule} from "ng-zorro-antd/space";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NzTooltipModule} from "ng-zorro-antd/tooltip";
import {NzDatePickerComponent, NzDatePickerModule} from "ng-zorro-antd/date-picker";
import {DragDropModule} from "@angular/cdk/drag-drop";
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import {NzLayoutModule} from "ng-zorro-antd/layout";
import {NzMenuModule} from "ng-zorro-antd/menu";
import {NzBreadCrumbModule} from "ng-zorro-antd/breadcrumb";
import {NzGridModule} from "ng-zorro-antd/grid";
import {NzDividerModule} from "ng-zorro-antd/divider";
import {NzInputModule} from "ng-zorro-antd/input";
import {NzModalModule} from "ng-zorro-antd/modal";
import {NzTypographyModule} from "ng-zorro-antd/typography";
import {RouterModule} from "@angular/router";
import {AppGuard} from "../app/app.guard";
import {AuthService} from "../../services/auth.service";
import {UsersItemComponent} from './components/users/users-item/users-item.component';
import {PlateItemComponent} from "./components/plate/plate-item/plate-item.component";
import {NzAvatarModule} from "ng-zorro-antd/avatar";
import {NzUploadModule} from "ng-zorro-antd/upload";
import {NzCardModule} from "ng-zorro-antd/card";
import {NzInputNumberModule} from "ng-zorro-antd/input-number";
import {NgxMaskDirective} from "ngx-mask";
import {NzPaginationModule} from "ng-zorro-antd/pagination";
import {RankingComponent} from './components/vote/ranking/ranking.component';
import {VotingComponent} from './components/voting/voting.component';
import {NzRadioModule} from "ng-zorro-antd/radio";
import {NzCommentModule} from "ng-zorro-antd/comment";

import { VoterItemComponent } from './components/voter/voter-item/voter-item.component';
import { CandidateItemComponent } from './components/candidate/candidate-item/candidate-item.component';
import { ResumeVoteComponent } from './components/vote/resume-vote/resume-vote.component';
import { RankingItemComponent } from './components/vote/ranking/ranking-item/ranking-item.component';
import {NzListModule} from "ng-zorro-antd/list";
import {NzCollapseModule} from "ng-zorro-antd/collapse";


@NgModule({
    exports: [
        VotingComponent
    ], imports: [CommonModule,
    FormsModule,
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
    NzDatePickerModule,
    NzSelectModule,
    NzSwitchModule,
    NzSpaceModule,
    NzModalModule,
    DragDropModule,
    ReactiveFormsModule,
    NzTypographyModule,
    RouterModule.forChild(ROUTES),
    NzAvatarModule,
    NzUploadModule,
    NzCardModule,
    NzInputNumberModule,
    NgxMaskDirective,
    NzPaginationModule,
    NzPaginationModule,
    NzRadioModule,
    NzCommentModule,
    NzListModule,
    NzCollapseModule, VoteComponent,
    UsersComponent,
    PlateComponent,
    VoteItemComponent,
    PlateItemComponent,
    UsersItemComponent,
    RankingComponent,
    VotingComponent,
    VoterItemComponent,
    CandidateItemComponent,
    ResumeVoteComponent,
    RankingItemComponent], providers: [
        AppGuard,
        AuthService,
        NzDatePickerComponent,
        provideHttpClient(withInterceptorsFromDi())
    ] })
export class CoreModule {
}
