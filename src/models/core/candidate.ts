import {ModelBase} from "../model-base";

export class Candidate extends ModelBase {
    name: string
    password: string
    email: string
    cellphone: string
    last_login: Date
    is_superuser: boolean
    is_staff: boolean
    avatar_url: any
    file_name: string
    active: boolean
    disabled: boolean
}
