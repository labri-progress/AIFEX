import { generate } from "shortid";
import Action, { ActionLabel } from "./Action";
import Evaluation from "./Evaluation";
import Step from "./Step";
import StepState from "./StepState";

export default class Evaluator {

    public readonly id: string;
    public readonly sessionId: string;
    public description: string;

    public step: Step;

    constructor(sessionId: string, step: Step, id?: string, description: string = "") {
        this.sessionId = sessionId;
        this.step = step;
        if (id !== undefined && id !== null) {
            this.id = id;
        } else {
            this.id = generate();
        }
        this.description = description;
    }

    get expresionEvaluated(): string {
        return this.step.expression;
    }

    public evaluate(sequence: Action[]): Promise<Evaluation> {
        return new Promise((resolve) => {
            const sequenceEvaluation = new Evaluation();

            const step = this.step;
            if (step) {
                const { isAccepted, nextActionList } = this.evaluateStep(sequence, step);
                sequenceEvaluation.nextActionList = nextActionList;
                sequenceEvaluation.isAccepted = isAccepted;
            }
            resolve(sequenceEvaluation);
        });
    }

    private evaluateStep(sequence: Action[], step: Step): {
        isAccepted: boolean,
        nextActionList: Action[]
    } {
        if (step.isEmpty) {
            return {
                isAccepted: true,
                nextActionList: step.firstActionList,
            };
        }
        
        const state = step.followSequence(sequence);
        if (!state) {
            return {
                isAccepted: false,
                nextActionList: step.firstActionList
            };
        }

        const isAccepted = step.isCompleted(state);
        const nextTransitionMap: Map<ActionLabel, StepState> = step.nextTransitionMap(state);
        const nextActionLabelList: ActionLabel[] = Array.from(nextTransitionMap.keys());
        const nextActionList = nextActionLabelList.map(actionLabel => Action.labelToAction(actionLabel));

        return {
            isAccepted,
            nextActionList,
        };
    }


}
