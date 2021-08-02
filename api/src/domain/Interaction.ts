export default class Interaction {
    public readonly index: number;
    public readonly concreteType: string;
    public readonly kind: string;
    public readonly value: string;
    public readonly date: Date;

    constructor(index: number, concreteType: string, kind: string, value: string, date?: Date) {
        this.index = index;
        this.concreteType = concreteType;
        this.kind = kind;
        this.value = value;
        if (date) {
            this.date = date;
        } else {
            this.date = new Date();
        }
    }
    
}

