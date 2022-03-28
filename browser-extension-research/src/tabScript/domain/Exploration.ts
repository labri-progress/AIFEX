import Action from "./Action";

export default class Exploration {

    private _actions: (Action)[];

    constructor() {
        this._actions = [];
    }

    isEmpty(): boolean {
        return this._actions.length <= 1;
    }

}