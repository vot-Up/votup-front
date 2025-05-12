import {Injectable} from "@angular/core";
import {User} from "../../models/core/user";

@Injectable()
export class AppVariables {
    user?: User;
    routes?: string[];
}
