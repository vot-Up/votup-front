import {Directive, HostListener, input} from "@angular/core";

@Directive({
    selector: `input[appUppercase]`,
    exportAs: "appUppercase",
})
export class UppercaseDirective {

    readonly upperCase = input<string>(undefined);

    private getCaret(element: HTMLInputElement) {
        return {
            start: element.selectionStart,
            end: element.selectionEnd,
        };
    }

    private setCaret(element: HTMLInputElement, start: number, end: number) {
        element.selectionStart = start;
        element.selectionEnd = end;
        element.focus();
    }

    private dispatchEvent(el: HTMLInputElement, eventType: string) {
        const event = document.createEvent("Event");
        event.initEvent(eventType, false, false);
        el.dispatchEvent(event);
    }

    private convertValue(el: HTMLInputElement, value: string) {
        el.value = value.toUpperCase();
        this.dispatchEvent(el, "input");
    }

    @HostListener("input", ["$event.target", "$event.target.value"])
    onInput(el: HTMLInputElement, value: string): void {

        if (!this.upperCase() && "function" === typeof value.toUpperCase && value.toUpperCase() !== value) {
            let {start, end} = this.getCaret(el);
            if (value[0] === " " && start === 1 && end === 1) {
                start = 0;
                end = 0;
            }
            this.convertValue(el, value);
            this.setCaret(el, start, end);
        }
    }
}
