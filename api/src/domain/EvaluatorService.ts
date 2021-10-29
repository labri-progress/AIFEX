import Action from "./Action";
import Evaluation from "./Evaluation";
import Evaluator from "./Evaluator";

export default interface EvaluatorService {
    getEvaluator(sessionId: string): Promise<Evaluator | undefined>;
    updateEvaluator(sessionId: string, description: string, expression: string): Promise<void>;
    createEvaluator(sessionId: string, description: string, expression: string):  Promise<void>;
    removeEvaluator(sessionId: string):  Promise<void>;
    evaluate(sessionId: string, actionList: Action[]): Promise<Evaluation | "Unauthorized">;
    evaluateSequenceByExpression(expression: string, actionList: Action[]): Promise<Evaluation>;
    expressionToDot(expression: string): Promise< {expressionIsValid: boolean, dot: string}>;
}