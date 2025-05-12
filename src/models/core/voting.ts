import {ModelBase} from "../model-base";

export class Voting extends ModelBase {
    date: Date
    description: string
    was_voted: boolean
}
