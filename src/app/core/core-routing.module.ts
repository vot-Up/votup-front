import {Routes} from '@angular/router';
import {VoteComponent} from "./components/vote/vote.component";
import {PlateComponent} from "./components/plate/plate.component";
import {UsersComponent} from "./components/users/users.component";
import {VoteItemComponent} from "./components/vote/vote-item/vote-item.component";
import {UsersItemComponent} from "./components/users/users-item/users-item.component";
import {VoterComponent} from "./components/voter/voter.component";
import {CandidateComponent} from "./components/candidate/candidate.component";

export const ROUTES: Routes = [
    {path: 'vote', component: VoteComponent},
    {path: 'vote/:action', component: VoteItemComponent},
    {path: 'users', component: UsersComponent},
    {path: 'users/:action', component: UsersItemComponent},
    {path: 'voters', component: VoterComponent},
    {path: 'voters/:action', component: VoterComponent},
    {path: 'candidates', component: CandidateComponent},
    {path: 'candidates/:action', component: CandidateComponent},
    {path: 'candidate_group', component: PlateComponent},
];
