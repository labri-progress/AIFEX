import IStepParser from "./IStepParser";
import Step from "./Step";

export default class StepFactory {

    public stepParser: IStepParser;

    constructor(stepParser: IStepParser) {
        this.stepParser = stepParser;
    }

    public checkExpressionValidity(expression: string): Promise<boolean> {
        return this.stepParser.parseStepExpression(expression).then((ast) => {
            if (ast!== undefined && ast !== null) {
                return true;
            } else {
                throw new Error("The expression was not parser correctly");
            }
        }).catch((e) => {
            return false;
        })
    }

    public createStep(expression: string): Promise<Step|undefined> {
        if (expression.length === 0) {
            return Promise.resolve(new Step("", null));
        }

        return this.stepParser.parseStepExpression(expression).then((ast) => {
            return ast.buildNFA();
        }).then((nfa) => {
            return nfa.toDFA();
        }).then((dfa) => {
            return new Step(expression, dfa);
        }).catch(e => {
            return undefined;
        })
    }

}
