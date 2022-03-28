import Observation from "./Observation";
import Action from "./Action";

export default class Exploration {

    private _actions: (Action | Observation )[];

    constructor() {
        this._actions = [];
    }

    isEmpty(): boolean {
        return this._actions.length <= 1;
    }

}