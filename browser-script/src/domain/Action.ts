import Rule from "./Rule";

export default class Action {

    public prefix: string;
    public suffix: string | undefined;
    public ruleList: Rule[];
    public htmlElementList: (HTMLElement|SVGElement)[];
    public date: Date;

    constructor(prefix: string, suffix?: string, ruleList: Rule[] = [], htmlElementList: HTMLElement[]= []) {
        this.prefix = prefix;
        this.suffix = suffix;
        this.ruleList = ruleList;
        this.htmlElementList = htmlElementList;
        this.date = new Date();
    }

    public setRuleList(ruleList: Rule[]): void {
        this.ruleList = ruleList;
    }

    public getConcreteType(): string {
        return "Action";
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