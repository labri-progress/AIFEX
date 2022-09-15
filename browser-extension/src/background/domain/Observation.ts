export default class Observation {

    kind: string;
    value: string;
    index: number | undefined;
    date: Date;
    concreteType: string;

    constructor(kind: string, value: string, index?: number) {
        this.kind = kind;
        this.value = value;
        this.index = index;
        this.date = new Date();
        this.concreteType = 'Observation';
    }

    toString(): string {
        if (this.value) {
            return `${this.kind}$${this.value}`
        } else {
            return this.kind
        }
    }

    getConcreteType(): string {
        return "Observation";
    }

    toPrintableText(): string {
        if (this.value) {
            return `Observation : ${this.kind} - ${this.value}`
        } else {
            return `Observation : ${this.kind}`
        }
    }


}