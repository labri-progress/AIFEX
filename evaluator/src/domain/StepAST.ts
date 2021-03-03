
import IInteraction from "./Interaction";
import StepNFA from "./StepNFA";
import { STEP_OPERATOR } from "./StepOperator";
import StepState from "./StepState";
export default class StepAST {

    public label: STEP_OPERATOR | IInteraction;
    public left: StepAST;
    public right: StepAST;
    public parameter: string;

    constructor(label: STEP_OPERATOR | IInteraction, left: StepAST, right: StepAST, parameter: string) {
        this.left = left;
        this.right = right;
        this.label = label;
        this.parameter = parameter;
    }

    public buildNFA(): Promise<StepNFA> {
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

    private buildOr(): Promise<StepNFA> {
        return  Promise.all([this.left.buildNFA(), this.right.buildNFA()])
        .then(([leftNFA, rightNFA]) => {
            return leftNFA.or(rightNFA);
        });
    }

    private buildArrow(): Promise<StepNFA> {
        return  Promise.all([this.left.buildNFA(), this.right.buildNFA()])
        .then(([leftNFA, rightNFA]) => {
            return leftNFA.arrow(rightNFA);
        });
    }

    private buildSeq(): Promise < StepNFA > {
        return  Promise.all([this.left.buildNFA(), this.right.buildNFA()])
        .then(([leftNFA, rightNFA]) => {
            return leftNFA.sequence(rightNFA);
        });
    }

    private buildInteraction(): Promise < StepNFA > {
        const start = new StepState();
        const end = new StepState();
        const interaction = this.label as IInteraction;
        const nfa = new StepNFA(start, [end], [start, end ], new Map());
        nfa.addTransition(start, end, interaction.toString());

        return Promise.resolve(nfa);
    }

    private buildNot():Promise<StepNFA> {
        return this.left.buildNFA().then((stepNFA) => {
            return stepNFA.negation();
        })
    }

    private buildKleenPlus():Promise<StepNFA> {
        return this.left.buildNFA()
            .then(stepNFA => {
                return stepNFA.kleenPlus();
            });
    }

    private buildIteration(): Promise<StepNFA> {
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
