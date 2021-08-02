import { Kind } from "./Kind";

export default class Authorization {
    readonly kind : Kind;
    readonly key : string;

    constructor(kind : Kind, key : string) {
        this.kind = kind;
        this.key = key;
    }

}