import Action from "./Action";
import Evaluation from "./Evaluation";
import Evaluator from "./Evaluator";

export default interface EvaluatorService {
    getEvaluator(sessionId: string): Promise<Evaluator | "noEvaluatorForSession">;
    updateEvaluator(sessionId: string, description: string, expression: string): any;
    createEvaluator(sessionId: string, description: string, expression: string): any;
    removeEvaluator(sessionId: string): any;
    evaluateSequenceByExpression(expression: string, actionList: Action[]): Promise<Evaluation>;
    expressionToDot(expression: string): Promise< {expressionIsValid: boolean, dot: string}>;
}