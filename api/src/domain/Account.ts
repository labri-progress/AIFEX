import Authorization from "./Authorization";

export default class Account  {
    private _username : string;//id
    private _authorizationSet : Authorization[];

    constructor(username : string, authorizationSet: Authorization[]) {
        this._username = username;
        this._authorizationSet = authorizationSet;
    }

    get username() : string {
        return this._username;
    }

    get authorizationSet() : Authorization[] {
        return [...this._authorizationSet];
    }
}