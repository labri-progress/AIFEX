export default class Tab {
    private _id : number;
    private _isActivated : boolean;
    private _isConnected : boolean;

    constructor(id : number) {
        if (id === null || id === undefined || isNaN(id)) {
            throw new Error('cannot create ManagedTab without id')
        }
        this._id = id;
        this._isActivated = false;
        this._isConnected = false;
    }

    get id() : number {
        return this._id;
    }

    get isConnected() : boolean {
        return this._isConnected;
    }

    get isActivated() : boolean {
        return this._isActivated;
    }

    activate(): void {
        this._isActivated = true;
    }

    deActivate(): void {
        this._isActivated = false;
    }

    connect(): void {
        this._isConnected = true;
    }

    disconnect(): void {
        this._isConnected = false;
    }


}