import Authorization from "./Authorization";

export default class Invitation {
    private _username: string;
    private _authorization: Authorization;

    constructor(username: string, authorization: Authorization) {
        this._username = username;
        this._authorization = authorization;
    }

    public get username(): string {
        return this._username;
    }

    public get authorization(): Authorization {
        return this._authorization;
    }
}