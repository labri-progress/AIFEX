import { Kind } from "./Kind";

export default class Authorization {
    private _kind : Kind;
    private _key : string;

    constructor(kind : Kind, key : string) {
        this._kind = kind;
        this._key = key;
    }

    get kind() : Kind {
        return this._kind;
    }

    get key() : string {
        return this._key;
    }

}