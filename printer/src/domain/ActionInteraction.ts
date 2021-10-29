import Action from "./Action";
import Interaction from "./Interaction";

// Value Object
export default class ActionInteraction extends Interaction {
    public readonly action: Action;

    constructor(index: number, action: Action) {
        super(index);
        this.action = action;
    }

    public toString(): string {
        if (this.action.value) {
            return `${this.action.kind}$${this.action.value}`;
        } else {
            return this.action.kind;
        }
    }

}
