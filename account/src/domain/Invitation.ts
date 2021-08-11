import Authorization from "./Authorization";

export default class Invitation {
    private _fromUsername: string;
    private _toUsername: string;
    private _authorization: Authorization;

    constructor(fromUsername: string, toUsername: string, authorization: Authorization) {
        this._fromUsername = fromUsername;
        this._toUsername = toUsername;
        this._authorization = authorization;
    }

    public get fromUsername(): string {
        return this._fromUsername;
    }

    public get toUsername(): string {
        return this._toUsername;
    }

    public get authorization(): Authorization {
        return this._authorization;
    }
}
