import Authorization from "./Authorization";

export default class Account  {
    private _username : string;//id
    private _email : string;
    private _salt : Uint8Array;
    private _hash : Uint8Array;
    private _authorizationSet : Authorization[];

    constructor(username : string, email : string, salt: Uint8Array, hash : Uint8Array) {
        this._username = username;
        this._email = email;
        this._salt = salt;
        this._hash = hash;
        this._authorizationSet = [];
    }

    get username() : string {
        return this._username;
    }

    get email() : string {
        return this._email;
    }

    get salt() : Uint8Array {
        return this._salt;
    }

    get hash() : Uint8Array {
        return this._hash;
    }

    get authorizationSet() : Authorization[] {
        return [...this._authorizationSet];
    }

    addAuthorization(newAuthorization : Authorization) : void {
        if (!this._authorizationSet.find(authorization => authorization.key === newAuthorization.key)) {
            this._authorizationSet.push(newAuthorization);
        }
    }

    removeAuthorization(existingAuthorization : Authorization) : void {
        const index = this._authorizationSet.findIndex(authorization => {
            const sameKey = (authorization.key === existingAuthorization.key);
            const sameKind = (authorization.kind === existingAuthorization.kind);
            return sameKey && sameKind;
        });

        if (index !== -1) {
            this._authorizationSet.splice(index, 1);
        }
    }

}