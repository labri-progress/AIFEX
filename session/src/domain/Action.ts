// Value Object
export default class Action {

    public readonly prefix: string;
    public readonly suffix: string | undefined;

    constructor(prefix: string, suffix?: string ) {
        this.prefix = prefix;
        this.suffix = suffix;
    }
}
