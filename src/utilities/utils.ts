import {SafeUrl} from "@angular/platform-browser";

export class Utils {

    public static getNickname(name: string): string {
        let str = "";

        if (!name) {
            return str;
        }
        const split = name.split(" ");
        if (split.length > 0) {
            str = split[0].charAt(0);
            if (split.length > 1) {
                str += split[1].charAt(0);
            }
        }
        return str.toUpperCase();
    }

    public static convertBase64ToImage(base64: string | Blob): string {
        return base64 ? "data:image/png;base64," + base64 : null;
    }

    public static convertImageToBlob(data: SafeUrl, type: string) {
        // convert base64 to raw binary data held in a string
        const byteString = atob(data.toString().split(",")[1]);

        // write the bytes of the string to an ArrayBuffer
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        // write the ArrayBuffer to a blob, and you're done
        return new Blob([ab], {type: type});
    }

    public static downloadFileFromBlob(file: Blob, filename: string): void {
        const fileUrl = (window.URL || window["webkitURL"]).createObjectURL(file);
        const anchor = document.createElement("a");
        anchor.download = filename;
        anchor.href = fileUrl;
        anchor.dispatchEvent(
            new MouseEvent("click", {bubbles: true, cancelable: true, view: window})
        );
        anchor.remove();
    }

};
