import Action from "./Action";

export default class Session {

    private _id: string;
    private _baseURL: string;
    private _name: string;
    private _explorations: Action[];

    constructor(id: string,
        baseURL: string,
        name: string,
        explorations: Action[]) 
    {
        this._id = id;
        this._baseURL = baseURL;
        this._name = name;
        this._explorations = explorations
    }

    get id(): string {
        return this._id;
    }

    get baseURL(): string {
        return this._baseURL;
    }

    get name(): string {
        return this._name;
    }

    get explorations(): Action[] {
        return this._explorations.slice();
    }

}
