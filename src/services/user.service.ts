interface IUser {
    // items: any,
    loading: boolean
}

export class UserService {
    users: IUser = {
        loading: false
    }
}
