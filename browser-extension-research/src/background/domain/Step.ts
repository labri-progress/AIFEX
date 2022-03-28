export default class Step {
    public name: string;
    public expression: string;

    constructor(name: string, expression: string) {
        this.name = name;
        this.expression = expression;
    }
}