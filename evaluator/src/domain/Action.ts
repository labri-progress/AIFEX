export type ActionLabel = string;

export default class Action {
    public prefix: string;
    public suffix: string|undefined;

    constructor(prefix: string, suffix?: string) {
        this.prefix = prefix;
        this.suffix = suffix;
    }

    get label(): ActionLabel {
        if (!this.suffix) {
            return this.prefix;
        }
        return `${this.prefix}$${this.suffix}`;    
    }

    public static labelToAction(value: string): Action {
        if (value.includes("$")) {
            const [prefix, suffix] = value.split("$");
            return new Action(prefix, suffix);
        } else {
            return new Action(value);
        }

    }

    public toString(): string {
        if (this.suffix) {
            return `${this.prefix}$${this.suffix}`;
        } else {
            return this.prefix;
        }
    }
}
