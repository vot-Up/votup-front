import {ModelBase} from "../model-base";
import {Plate} from "./plate";
import {Candidate} from "./candidate";

export class PlateUser extends ModelBase{
    plate: Plate | string | number;
    candidate: Candidate | string | number;
    type: string;
}
