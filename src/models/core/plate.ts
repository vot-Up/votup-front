import {ModelBase} from "../model-base";
import {PlateUser} from "./plate-user";

export class Plate extends ModelBase {
    name: string;
    plate: PlateUser[];
    was_voted: boolean;
}
