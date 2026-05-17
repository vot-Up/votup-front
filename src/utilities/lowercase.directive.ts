import { Directive, HostListener, Input } from "@angular/core";

@Directive({
    selector: `input[lowercase]`,
    exportAs: "lowercase",
})
export class LowercaseDirective {

    @Input() lowerCase: string;

    private getCaret(element) {
        return {
            start: element.selectionStart,
            end: element.selectionEnd,
        };
    }

    private setCaret(element, start, end) {
        element.selectionStart = start;
        element.selectionEnd = end;
        element.focus();
    }

    private dispatchEvent(el, eventType) {
        const event = document.createEvent("Event");
        event.initEvent(eventType, false, false);
        el.dispatchEvent(event);
    }

    private convertValue(el, value) {
        el.value = value.toLowerCase();
        this.dispatchEvent(el, "input");
    }

    @HostListener("input", ["$event.target", "$event.target.value"])
    onInput(el: any, value: string): void {
        if (!this.lowerCase && "function" === typeof value.toLowerCase && value.toLowerCase() !== value) {
            let { start, end } = this.getCaret(el);
            if (value[0] === " " && start === 1 && end === 1) {
                start = 0;
                end = 0;
            }
            this.convertValue(el, value);
            this.setCaret(el, start, end);
        }
    }
}
