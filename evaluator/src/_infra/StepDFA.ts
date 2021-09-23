
import Step from "../domain/Step";
import Action from "../domain/Action";
import EvaluatorNFA from "./NFA";
import StepState, { transitionType } from "../domain/StepState";

export default class StepDFA implements Step {
    public expression: string;
    public evaluatorNFA: EvaluatorNFA | null;

    constructor(expression: string, dfa: EvaluatorNFA | null) {
        this.expression = expression;
        this.evaluatorNFA = dfa;
    }
    get isEmpty(): boolean {
        if (!this.evaluatorNFA) {
            return true;
        }
        return this.nextTransitionMap(this.evaluatorNFA.startState).size === 0;
    }
    
    isCompleted(state: StepState): boolean {
        if (!this.evaluatorNFA) {
            return true;
        }
        return this.evaluatorNFA.finalStates.includes(state);
    }

    nextTransitionMap(state: StepState): Map<string, StepState> {
        const transitionMap = new Map();
        if (!this.evaluatorNFA) {
            return transitionMap;
        }
        const map = this.evaluatorNFA?.transitions.get(state);
        if (map === undefined) {
            return transitionMap;
        } else {
            for (const [label, nextStateList] of map.entries()) {
                // It is a DFA, so there is only one state per label
                transitionMap.set(label, nextStateList[0])
            }
            return transitionMap;
        }
    }

    get firstActionList(): Action[] {
        if (!this.evaluatorNFA) {
            return [];
        }
        const transitions = this.evaluatorNFA.transitions.get(this.evaluatorNFA.startState)
        if (transitions === undefined || transitions === null) {
            return [];
        }
        return Array.from(transitions.keys())
                    .map((label) => Action.labelToAction(label));
    }

    public followSequence(sequence: Action[]): StepState {
        if (!this.evaluatorNFA) {
            throw new Error("Step has not been initialized")
        }
        let state: StepState | "Exit" | null = this.evaluatorNFA.startState;
        const actionsNotConsumed = sequence.slice();
        while (actionsNotConsumed.length > 0 && !this.isEnteringAction(actionsNotConsumed[0])) {
            actionsNotConsumed.shift();
        }
        while (actionsNotConsumed.length > 0) {
            const action = actionsNotConsumed.shift();
            if (!action) {
                break;
            }
            state = this.followAction(state, action);
            if (state === null) {
                throw new Error("Reached a null state");
            }
            else if (state === "Exit") {
                state = this.evaluatorNFA.startState;
            }
            if (this.evaluatorNFA.isFinalState(state)) {
                break;
            }
        }
        return state;
    }

    public toDot(title: string) : string | null {
        if (! this.evaluatorNFA) {
            return null
        }
        return this.evaluatorNFA.toDot(title);
    }

    private isEnteringAction(action: Action): boolean {

        return this.firstActionList.some((firstAction) => {
            if (firstAction.label === action.label) {
                return true;
            } else if (firstAction.toString() === action.toString()) {
                return true;
            } else if (firstAction.toString() === transitionType.star) {
                return true;
            }
        });
    }

    private followAction(currentState: StepState, action: Action): StepState | "Exit" | null{
        if (!this.evaluatorNFA) {
            return null;
        }
        let successor = this.getSuccessor(currentState, action);
        if (successor) {
            return successor;
        }
        successor = this.getSuccessor(this.evaluatorNFA.startState, action);
        if (successor) {
            return successor;
        }
        return this.evaluatorNFA.startState;
    }

    private getSuccessor(state: StepState, action: Action): StepState | "Exit" | null {
        if (! this.evaluatorNFA) {
            return null;
        }
        if (this.evaluatorNFA.transitions.has(state)) {
            const transition = this.evaluatorNFA.transitions.get(state);
            if (!transition) {
                return "Exit";
            }
            if (transition.has(action.label)) {
                const destinationsByLabel = transition.get(action.label);
                if (!destinationsByLabel) {
                    return "Exit";
                }
                return destinationsByLabel[0];
            } else if (transition.has(action.toString())) {
                const destinationsByLabel = transition.get(action.toString());
                if (!destinationsByLabel) {
                    return "Exit";
                }
                return destinationsByLabel[0];
            } else if (transition.has(transitionType.star)) {
                const destinationsByLabel = transition.get(transitionType.star);
                if (!destinationsByLabel) {
                    return "Exit";
                }
                return destinationsByLabel[0];
            } else {
                return "Exit";
            }
        } else {
            return null;
        }
    }

}
