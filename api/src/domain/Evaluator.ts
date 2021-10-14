import Action from "./Action";
import Evaluation from "./Evaluation";


export default class Evaluator {


    public id: string;
    public description: string;
    public expression: string;
    public sessionId: string;

    constructor(sessionId: string, id: string, expression: string, description: string) {
        this.sessionId = sessionId;
        this.expression = expression;
        this.description = description;
        this.id = id;
    }

}
