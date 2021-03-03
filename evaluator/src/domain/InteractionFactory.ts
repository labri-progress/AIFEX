import Action from "./Action";
import Interaction from "./Interaction";

export default class InteractionFactory {

    public static parseInteraction(value: string): Interaction {
        if (value.includes("$")) {
            const [prefix, suffix] = value.split("$");
            return new Action(prefix, suffix);
        } else {
            return new Action(value);
        }

    }

    public static createAction(prefix: string, suffix?: string): Action {
        if (suffix !== undefined) {
            if (typeof suffix !== "string") {
                throw new Error("invalid suffix type")
            }
            return new Action(prefix, suffix);
        } else {
            return new Action(prefix);
        }
    }

}
