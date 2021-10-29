
import IInteraction from "../domain/Action";
import EvaluatorNFA from "./NFA";
import { STEP_OPERATOR } from "../domain/StepOperator";
import StepState from "../domain/StepState";
export default class AST {

    public label: STEP_OPERATOR | IInteraction;
    public left: AST;
    public right: AST;
    public parameter: string;

    constructor(label: STEP_OPERATOR | IInteraction, left: AST, right: AST, parameter: string) {
        this.left = left;
        this.right = right;
        this.label = label;
        this.parameter = parameter;
    }

    public buildNFA(): Promise<EvaluatorNFA> {
        if (this.label === STEP_OPERATOR.or) {
            return this.buildOr();
        } else if (this.label === STEP_OPERATOR.arrow) {
            return this.buildArrow();
        } else if (this.label === STEP_OPERATOR.seq) {
            return this.buildSeq();
        } else if (this.label === STEP_OPERATOR.not) {
            return this.buildNot();
        } else if (this.label === STEP_OPERATOR.kleenPlus) {
            return this.buildKleenPlus();
        } else if (this.label === STEP_OPERATOR.iteration) {
            return this.buildIteration();
        } else {
            return this.buildInteraction();
        }
    }

    private buildOr(): Promise<EvaluatorNFA> {
        return  Promise.all([this.left.buildNFA(), this.right.buildNFA()])
        .then(([leftNFA, rightNFA]) => {
            return leftNFA.or(rightNFA);
        });
    }

    private buildArrow(): Promise<EvaluatorNFA> {
        return  Promise.all([this.left.buildNFA(), this.right.buildNFA()])
        .then(([leftNFA, rightNFA]) => {
            return leftNFA.arrow(rightNFA);
        });
    }

    private buildSeq(): Promise < EvaluatorNFA > {
        return  Promise.all([this.left.buildNFA(), this.right.buildNFA()])
        .then(([leftNFA, rightNFA]) => {
            return leftNFA.sequence(rightNFA);
        });
    }

    private buildInteraction(): Promise < EvaluatorNFA > {
        const start = new StepState();
        const end = new StepState();
        const action = this.label as IInteraction;
        const nfa = new EvaluatorNFA(start, [end], [start, end ], new Map());
        nfa.addTransition(start, end, action.toString());

        return Promise.resolve(nfa);
    }

    private buildNot():Promise<EvaluatorNFA> {
        return this.left.buildNFA().then((stepNFA) => {
            return stepNFA.negation();
        })
    }

    private buildKleenPlus():Promise<EvaluatorNFA> {
        return this.left.buildNFA()
            .then(stepNFA => {
                return stepNFA.kleenPlus();
            });
    }

    private buildIteration(): Promise<EvaluatorNFA> {
        return this.left.buildNFA().then(stepNFA => {
            let numberOfIteration;
            try {
                numberOfIteration = parseInt(this.parameter);
                return stepNFA.iteration(numberOfIteration);
            }
            catch(e) {
                throw new Error(` Cannot cast int with iteration parameter : ${this.parameter}`);
            }
        })
    }
}
