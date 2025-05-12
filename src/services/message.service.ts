import {NzMessageService} from "ng-zorro-antd/message";

export class MessageService {
    constructor(public message: NzMessageService) {
    }

    createMessage(type: string): void {
        this.message.create(type, `This is a message of ${type}`);
    }

    success(){
        this.createMessage('success')
    }

    error(){
        this.createMessage('error')
    }

    warning(){
        this.createMessage('warning')
    }
}
