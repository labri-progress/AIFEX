
export default class Answer {
    kind : string;
    value: string;
    index: number;
    date: Date;


    constructor(question: string, value: string, index: number= 0) {
        if (question === undefined || question === null) {
            throw new Error('cannot create action without a kind');
        }
        this.kind = question;
        this.value = value;
        this.index = index;
        this.date = new Date();
    }

    toString(): string {
        if (this.value) {
            return `${this.kind}?${this.value}`
        } else {
            return this.kind
        }
    }

    getConcreteType(): string {
        return "Answer";
    }

    toPrintableText(): string {
        if (this.value) {
            return `Reponse : ${this.kind} ? ${this.value}`
        } else {
            return `Reponse : ${this.kind}`;
        }
    }


}