import {ModelBase} from "../model-base";
import {Plate} from "./plate";
import {Voting} from "./voting";

export class VotingPlate extends ModelBase {
    plate: Plate | string | number
    voting: Voting | string | number
}
