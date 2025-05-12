import {AbstractControl, FormControl, ValidationErrors, ValidatorFn, Validators} from "@angular/forms";

// import * as moment from "moment";

function isEmptyInputValue(value: any): boolean {
    return value == null || value.length === 0;
}

export class CustomValidators extends Validators {

    public static required(control: AbstractControl): ValidationErrors | null {
        try {
            return isEmptyInputValue(control.value) || !control.value.toString().match(/^(?!\s*$).+/g) ? {required: true} : null;
        } catch (e) {
            return isEmptyInputValue(control.value) ? {required: true} : null;
        }
    }

    public static nonStartWithBlank(control: AbstractControl): ValidationErrors | null {
        if (isEmptyInputValue(control.value)) {
            return null;
        }
        return !control.value.match(/^(?! ).*$/) ? {nonStartWithBlank: true} : null;
    }

    public static nonHexaColor(control: AbstractControl): ValidationErrors | null {
        if (isEmptyInputValue(control.value)) {
            return null;
        }
        return !control.value.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/) ? {nonHexaColor: true} : null;
    }

    public static nonPositive(control: AbstractControl): ValidationErrors | null {
        if (isEmptyInputValue(control.value)) {
            return null;
        }
        return control.value < 0 ? {nonPositive: true} : null;
    }

    public static booleanTrue(control: AbstractControl): ValidationErrors | null {
        if (isEmptyInputValue(control.value)) {
            return null;
        }
        return !control.value === true ? {booleanTrue: true} : null;
    }


    public static nonGtZero(control: AbstractControl): ValidationErrors | null {
        if (isEmptyInputValue(control.value)) {
            return null;
        }
        return control.value <= 0 ? {nonGtZero: true} : null;
    }

    public static nonGt(controlNameOrValue: number | string): ValidatorFn {
        return function (control: FormControl): ValidationErrors | null {
            if (isEmptyInputValue(control.value)) {
                return null;
            }
            let target = null;

            if (typeof controlNameOrValue === "number") {
                target = controlNameOrValue;
            } else {
                target = control.root.get(controlNameOrValue).value;
            }

            if (target) {
                if (control.value > target) {
                    return {nonGt: true};
                }
            }
            return null;
        };
    }

    public static nonLt(controlNameOrValue: number | string): ValidatorFn {
        return function (control: FormControl): ValidationErrors | null {
            if (isEmptyInputValue(control.value)) {
                return null;
            }
            let target = null;

            if (typeof controlNameOrValue === "number") {
                target = controlNameOrValue;
            } else {
                target = control.root.get(controlNameOrValue).value;
            }

            if (target) {
                if (control.value < target) {
                    return {nonLt: true};
                }
            }
            return null;
        };
    }

    // public static timeNonGt(controlName: string): ValidatorFn {
    //     return function (control: FormControl): ValidationErrors | null {
    //         if (isEmptyInputValue(control.value)) {
    //             return null;
    //         }
    //         const closed_at = control.root.get(controlName);
    //         if (closed_at) {
    //             if (moment(control.value, "hh:mm:ss") > moment(closed_at.value, "hh:mm:ss")) {
    //                 return {startGreaterThanEndTime: true};
    //             }
    //         }
    //         return null;
    //     };
    // }
    public static yearNonLt(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            const today = new Date().getTime();

            if (!(control && control.value)) {
                return null;
            }
            return control.value.getTime() < today
                ? {invalidDate: "tou cannot use past date"}
                : null;
        };
    }

    // public static timeNonLt(controlName: string): ValidatorFn {
    //     return function (control: FormControl): ValidationErrors | null {
    //         if (isEmptyInputValue(control.value)) {
    //             return null;
    //         }
    //         const closed_at = control.root.get(controlName);
    //         if (closed_at) {
    //             if (moment(control.value, "hh:mm:ss") < moment(closed_at.value, "hh:mm:ss")) {
    //                 return {endLessThanStartTime: true};
    //             }
    //         }
    //         return null;
    //     };
    // }

    public static nonHost(control: AbstractControl): ValidationErrors | null {
        const regex = "^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$";
        if (isEmptyInputValue(control.value)) {
            return null;
        }
        return !control.value.toString().match(regex) ? {nonHost: true} : null;
    }

    public static validEmail(control: AbstractControl): ValidationErrors {
        if (isEmptyInputValue(control.value)) {
            return null;
        }

        const regex = /[a-z\d!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z\d!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z\d](?:[a-z\d-]*[a-z\d])?\.)+[a-z\d](?:[a-z\d-]*[a-z\d])?/gi;

        return !control.value.toString().match(regex) ? {emailError: true} : null;
    }

    public static validLinkedinURL(control: AbstractControl): ValidationErrors {
        if (isEmptyInputValue(control.value)) {
            return null;
        }
        const splited_url = control.value.split("/");
        const regex = /https:\/\/www\.linkedin\.com\/in\/[a-z\d!-]?/i;
        if (!control.value.toString().match(regex) || splited_url[5]) {
            return {linkedinError: true};
        } else {
            return null;
        }
    }

    public static validFieldText(control: AbstractControl): ValidationErrors {
        if (isEmptyInputValue(control.value)) {
            return null;
        }
        const regex = /^(?! ).*[A-Za-z]+$/;

        return !control.value.toString().match(regex) ? {fieldError: true} : null;
    }

    public static validQuestionText(control: AbstractControl): ValidationErrors {
        if (isEmptyInputValue(control.value)) {
            return null;
        }
        const regex = /^(?! ).*[A-Za-z]+[?]/;

        return !control.value.toString().match(regex) ? {questionError: true} : null;
    }

    public static validAutoComplete(control: AbstractControl): ValidationErrors {
        if (isEmptyInputValue(control.value)) {
            return {required: true};
        }
        const url_foundation = control.value.match("http");
        if (url_foundation == null) {
            return {theFieldNotRegister: true};
        } else {
            return null;
        }
    }

    public static validEqual(controlName: string): ValidatorFn {
        return function (control: AbstractControl): ValidationErrors | null {
            if (isEmptyInputValue(control.value)) {
                return null;
            }
            const confirmPass = control.root.get(controlName).value;

            return control.value !== confirmPass ? {passwordNotMatch: true} : null;
        };
    }

    public static validPassword(control: AbstractControl): ValidationErrors {
        if (isEmptyInputValue(control.value)) {
            return null;
        }

        const regex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^\w\s]).{8,}$/;

        return !control.value.toString().match(regex) ? {passwordInvalid: true} : null;
    }

    // public static monthAndYear(control: AbstractControl): ValidationErrors {
    //     const value = control.value;
    //         if (!value) {
    //             return null;
    //         }
    //         const date = moment(value, "MM/YYYY", true);
    //         if (date.isValid()) {
    //             return null;
    //         }
    //     return { monthAndYear: true };
    // }

    public static validateNonEmpty(control: AbstractControl): ValidationErrors | null {
        const value = control.value as string;

        if (value.trim() === '') {
            return {emptyInput: true};
        }

        return null;
    }
}

