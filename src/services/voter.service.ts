interface IVoter {
    // items: any,
    loading: boolean
}

export class UserService {
    voters: IVoter = {
        loading: false
    }
}
