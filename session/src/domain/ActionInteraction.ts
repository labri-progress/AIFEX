import Action from "./Action";
import Interaction from "./Interaction";

export default class ActionInteraction extends Interaction {
    public readonly action: Action;

    constructor(index: number, action: Action, date?: Date) {
        super(index, date);
        this.action = action;
    }
}
