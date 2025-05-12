import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PhonePipe} from './phone-pipe/phone.pipe';
import {LowercaseDirective} from "../../utilities/lowercase.directive";
import {UppercaseDirective} from "../../utilities/uppercase.directive";


@NgModule({
    declarations: [
        PhonePipe,
        LowercaseDirective,
        UppercaseDirective
    ],
    imports: [
        CommonModule
    ],
    exports: [
        PhonePipe,
        LowercaseDirective,
        UppercaseDirective
    ]
})
export class SharedModule {
}
