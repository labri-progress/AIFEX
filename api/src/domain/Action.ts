export default class Action {
    public readonly index: number;
    public readonly prefix: string;
    public readonly suffix: string;
    public readonly date: Date;

    constructor(index: number, prefix: string, suffix: string, date?: Date) {
        this.index = index;
        this.prefix = prefix;
        this.suffix = suffix;
        if (date) {
            this.date = date;
        } else {
            this.date = new Date();
        }
    }
    
}

