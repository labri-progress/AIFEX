export default class Evaluator {
    public expression: string;
    public description: string;
    public sessionId: string;

    constructor(description: string, expression: string, sessionId: string) {
        this.expression = expression;
        this.description = description;
        this.sessionId = sessionId;        
    }
}