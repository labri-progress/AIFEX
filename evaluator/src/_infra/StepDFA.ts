
import Step from "../domain/Step";
import Action from "../domain/Action";
import StepNFA from "./StepNFA";
import StepState, { transitionType } from "../domain/StepState";

export default class StepDFA implements Step {
    public expression: string;
    public stepDFA: StepNFA | null;

    constructor(expression: string, dfa: StepNFA | null) {
        this.expression = expression;
        this.stepDFA = dfa;
    }
    get isEmpty(): boolean {
        if (!this.stepDFA) {
            return true;
        }
        return this.nextTransitionMap(this.stepDFA.startState).size > 0;
    }
    
    isCompleted(state: StepState): boolean {
        if (!this.stepDFA) {
            return true;
        }
        return this.stepDFA.finalStates.includes(state);
    }

    nextTransitionMap(state: StepState): Map<string, StepState> {
        const transitionMap = new Map();
        if (!this.stepDFA) {
            return transitionMap;
        }
        const map = this.stepDFA?.transitions.get(state);
        if (map === undefined) {
            return transitionMap;
        } else {
            for (const [label, nextStateList] of map) {
                // It is a DFA, so there is only one state per label
                transitionMap.set(label, nextStateList[0])
            }
            return transitionMap;
        }
    }

    get firstActionList(): Action[] {
        if (!this.stepDFA) {
            return [];
        }
        const transitions = this.stepDFA.transitions.get(this.stepDFA.startState)
        if (transitions === undefined || transitions === null) {
            return [];
        }
        return Array.from(transitions.keys())
                    .map((label) => Action.labelToAction(label));
    }

    public followSequence(sequence: Action[]): StepState {
        if (!this.stepDFA) {
            throw new Error("Step has not been initialized")
        }
        let state: StepState | "Exit" | null = this.stepDFA.startState;
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
                state = this.stepDFA.startState;
            }
            if (this.stepDFA.isFinalState(state)) {
                break;
            }
        }
        return state;
    }

    public toDot(title: string) : string | null {
        if (! this.stepDFA) {
            return null
        }
        return this.stepDFA.toDot(title);
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
        if (!this.stepDFA) {
            return null;
        }
        let successor = this.getSuccessor(currentState, action);
        if (successor) {
            return successor;
        }
        successor = this.getSuccessor(this.stepDFA.startState, action);
        if (successor) {
            return successor;
        }
        return this.stepDFA.startState;
    }

    private getSuccessor(state: StepState, action: Action): StepState | "Exit" | null {
        if (! this.stepDFA) {
            return null;
        }
        if (this.stepDFA.transitions.has(state)) {
            const transition = this.stepDFA.transitions.get(state);
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
