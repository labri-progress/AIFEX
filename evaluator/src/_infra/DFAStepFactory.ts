import StepDFA from "./StepDFA";
import IStepParser from "../domain/IStepParser";
import Step from "../domain/Step";
import StepFactory from "../domain/StepFactory";

export default class DFAStepFactory implements StepFactory {

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

    public createStep(expression: string): Promise<Step> {
        if (expression.length === 0) {
            return Promise.resolve(new StepDFA("", null));
        }

        return this.stepParser.parseStepExpression(expression).then((ast) => {
            return ast.buildNFA();
        }).then((nfa) => {
            return nfa.toDFA();
        }).then((dfa) => {
            return new StepDFA(expression, dfa);
        })
    }

}
