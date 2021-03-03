export default class Token  {

    private _token : string;
    
    constructor(token : string) {
        this._token = token;
    }

    get token() : string {
        return this._token;
    }

}
