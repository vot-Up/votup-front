import {User} from "../models/core/user";

interface IEventVoting {
    // items: any,
    loading: boolean
}

export class ResumeVoting {
    eventsVoting: IEventVoting = {
        loading: false
    }
}
