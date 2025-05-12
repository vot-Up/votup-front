import {ModelBase} from "../model-base";
import {PlateUser} from "./plate-user";

export class ResumeVote extends ModelBase {
    plate: PlateUser[];
    quantity: number
}
