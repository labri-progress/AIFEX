import Interaction from "./Interaction";

export default class Action implements Interaction {

    public prefix: string;
    public suffix: string|undefined;

    constructor(prefix: string, suffix?: string) {
        this.prefix = prefix;
        this.suffix = suffix;
    }

    public getLabel(): string {
        return this.prefix;
    }

    public toString(): string {
        if (!this.suffix) {
            return this.prefix;
        }
        return `${this.prefix}$${this.suffix}`;
    }

}
