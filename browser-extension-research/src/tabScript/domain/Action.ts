export default class Action {

    public prefix: string;
    public suffix: string | undefined;

    constructor(prefix: string, suffix?: string, ) {
        this.prefix = prefix;
        this.suffix = suffix;
    }

    public toString(): string {
        if (this.suffix) {
            return `${this.prefix}$${this.suffix}`;
        } else {
            return this.prefix;
        }
    }

    public equals(action: Action): boolean {
        return ((this.prefix === action.prefix) && (this.suffix === action.suffix))
    }

    static parseAction(actionText: string): Action {
        const parts = actionText.split("$");
        if (parts.length === 1) {
            return new Action(parts[0])
        // tslint:disable-next-line:no-magic-numbers
        } else if (parts.length === 2) {
            return new Action(parts[0], parts[1]);
        } else {
            throw new Error("Failed to parse action : " + actionText);
        }
    }


}