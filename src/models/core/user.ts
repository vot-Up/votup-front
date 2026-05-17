import {ModelBase} from "../model-base";

export class User extends ModelBase {
    name: string
    password: string
    email: string
    cellphone: string
    last_login: Date
    is_superuser: boolean
    is_staff: boolean
    avatar: string | Blob | null
    file_name: string
    is_active: boolean
}
