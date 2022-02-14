export default class Observation {
    public readonly index: number;
    public readonly prefix: string;
    public readonly suffix: string;
    public readonly date: Date;

    constructor(index: number, kind: string, value: string, date?: Date) {
        this.index = index;
        this.prefix = kind;
        this.suffix = value;
        if (date) {
            this.date = date;
        } else {
            this.date = new Date();
        }
    }
    
}

