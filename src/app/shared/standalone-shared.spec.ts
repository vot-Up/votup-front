import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhonePipe } from './phone-pipe/phone.pipe';
import { LowercaseDirective } from '../../utilities/lowercase.directive';
import { UppercaseDirective } from '../../utilities/uppercase.directive';

@Component({
    imports: [PhonePipe],
    template: '{{ value | phone }}',
})
class PhoneHostComponent {
    value = '92999998888';
}

@Component({
    imports: [LowercaseDirective],
    template: '<input appLowercase [value]="value">',
})
class LowercaseHostComponent {
    value = 'ABC';
}

@Component({
    imports: [UppercaseDirective],
    template: '<input appUppercase [value]="value">',
})
class UppercaseHostComponent {
    value = 'abc';
}

function inputElement<T>(fixture: ComponentFixture<T>): HTMLInputElement {
    return fixture.nativeElement.querySelector('input');
}

describe('standalone shared imports', () => {
    it('formats direct PhonePipe values without module indirection', () => {
        const pipe = new PhonePipe();

        expect(pipe.transform('5592999998888')).toBe('+55 (92) 99999-8888');
        expect(pipe.transform('559299998888')).toBe('+55 (92) 9999-8888');
        expect(pipe.transform('9299998888')).toBe('(92) 9999-8888');
        expect(pipe.transform('929999')).toBe('(92) 9999-');
        expect(pipe.transform('92')).toBe('(92) ');
        expect(pipe.transform('9')).toBe('(9');
        expect(pipe.transform('')).toBeUndefined();
    });

    it('imports PhonePipe directly and renders phone formatting', async () => {
        await TestBed.configureTestingModule({
            imports: [PhoneHostComponent],
        }).compileComponents();

        const fixture = TestBed.createComponent(PhoneHostComponent);
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent.trim()).toBe('(92) 99999-8888');
    });

    it('imports LowercaseDirective directly and lowercases input values', async () => {
        await TestBed.configureTestingModule({
            imports: [LowercaseHostComponent],
        }).compileComponents();

        const fixture = TestBed.createComponent(LowercaseHostComponent);
        fixture.detectChanges();

        const input = inputElement(fixture);
        input.value = 'VOTUP';
        input.setSelectionRange(input.value.length, input.value.length);
        input.dispatchEvent(new Event('input'));

        expect(input.value).toBe('votup');
    });

    it('does not rewrite lowercase values that are already normalized', async () => {
        await TestBed.configureTestingModule({
            imports: [LowercaseHostComponent],
        }).compileComponents();

        const fixture = TestBed.createComponent(LowercaseHostComponent);
        fixture.detectChanges();

        const input = inputElement(fixture);
        input.value = 'votup';
        input.setSelectionRange(input.value.length, input.value.length);
        input.dispatchEvent(new Event('input'));

        expect(input.value).toBe('votup');
    });

    it('imports UppercaseDirective directly and uppercases input values', async () => {
        await TestBed.configureTestingModule({
            imports: [UppercaseHostComponent],
        }).compileComponents();

        const fixture = TestBed.createComponent(UppercaseHostComponent);
        fixture.detectChanges();

        const input = inputElement(fixture);
        input.value = 'votup';
        input.setSelectionRange(input.value.length, input.value.length);
        input.dispatchEvent(new Event('input'));

        expect(input.value).toBe('VOTUP');
    });

    it('does not rewrite uppercase values that are already normalized', async () => {
        await TestBed.configureTestingModule({
            imports: [UppercaseHostComponent],
        }).compileComponents();

        const fixture = TestBed.createComponent(UppercaseHostComponent);
        fixture.detectChanges();

        const input = inputElement(fixture);
        input.value = 'VOTUP';
        input.setSelectionRange(input.value.length, input.value.length);
        input.dispatchEvent(new Event('input'));

        expect(input.value).toBe('VOTUP');
    });
});
