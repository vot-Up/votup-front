import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
    name: "cellphone"
})
export class CellphoneFormatePipe implements PipeTransform {
    public part1:string;
    public part2:string;
    public part3:string;
    public transform(value:number):string {
        const cellphone:string = value?.toString();
        this.part1 = cellphone?.slice(0,2);
        this.part2 = cellphone?.slice(2,6);
        this.part3 = cellphone?.slice(6,11);
        return `(${this.part1}) ${this.part2}-${this.part3}`;
    }
}
