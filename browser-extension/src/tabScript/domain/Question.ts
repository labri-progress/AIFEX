export default class Question {
    public text: string;

    constructor(text: string) {
        this.text = text;
    }

    toString(): string {
        return this.text;
    }
}
