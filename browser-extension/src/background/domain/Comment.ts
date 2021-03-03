export default class Comment {

    kind: string;
    value: string;
    index: number | undefined;
    date: Date;

    constructor(kind: string, value: string, index?: number) {
        this.kind = kind;
        this.value = value;
        this.index = index;
        this.date = new Date();
    }

    toString(): string {
        if (this.value) {
            return `${this.kind}$${this.value}`
        } else {
            return this.kind
        }
    }

    getConcreteType(): string {
        return "Comment";
    }

    toPrintableText(): string {
        if (this.value) {
            return `Comment : ${this.kind} - ${this.value}`
        } else {
            return `Comment : ${this.kind}`
        }
    }


}