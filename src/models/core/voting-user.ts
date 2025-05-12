import {ModelBase} from "../model-base";
import {Plate} from "./plate";
import {User} from "./user";
import {Voting} from "./voting";

export class VotingUser extends ModelBase{
    plate: Plate | string | number
    user: User | string | number
    voting: Voting | string | number
}
