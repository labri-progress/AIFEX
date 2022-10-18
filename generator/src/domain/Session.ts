import Action from "./Action";

export default class Session {

    private _id: string;
    private _baseURL: string;
    private _name: string;
    private _explorations: Array<Array<Action>>;

    constructor(id: string,
        baseURL: string,
        name: string,
        explorations: Array<Array<Action>>) 
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

    get explorations(): Array<Array<Action>> {
        return this._explorations.slice();
    }

}
