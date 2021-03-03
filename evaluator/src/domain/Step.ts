
import Interaction from "./Interaction";
import InteractionFactory from "./InteractionFactory";
import StepNFA from "./StepNFA";
import StepState, { transitionType } from "./StepState";

export default class Step {
    public expression: string;
    public stepDFA: StepNFA | null;

    constructor(expression: string, dfa: StepNFA | null) {
        this.expression = expression;
        this.stepDFA = dfa;
    }

    get enteringInteractionList(): Interaction[] {
        if (!this.stepDFA) {
            return [];
        }
        const transitions = this.stepDFA.transitions.get(this.stepDFA.startState)
        if (transitions === undefined || transitions === null) {
            return [];
        }
        return Array.from(transitions.keys())
                    .map((label) => InteractionFactory.parseInteraction(label));
    }

    public followSequence(sequence: Interaction[]): StepState | null {
        if (!this.stepDFA) {
            return null;
        }
        let state: StepState | null = this.stepDFA.startState;
        const interactionsNotConsumed = sequence.slice();
        while (interactionsNotConsumed.length > 0 && !this.isEnteringInteraction(interactionsNotConsumed[0])) {
            interactionsNotConsumed.shift();
        }
        while (interactionsNotConsumed.length > 0) {
            const interaction = interactionsNotConsumed.shift();
            if (!interaction) {
                break;
            }
            state = this.followInteraction(state, interaction);
            if (state === null) {
                return null;
            }
            if (this.stepDFA.isFinalState(state)) {
                break;
            }
        }
        return state;
    }

    private isEnteringInteraction(interaction: Interaction): boolean {

        return this.enteringInteractionList.some((enteringInteraction) => {
            if (enteringInteraction.getLabel() === interaction.getLabel()) {
                return true;
            } else if (enteringInteraction.toString() === interaction.toString()) {
                return true;
            } else if (enteringInteraction.toString() === transitionType.star) {
                return true;
            }
        });
    }

    private followInteraction(currentState: StepState, interaction: Interaction): StepState | null {
        if (!this.stepDFA) {
            return null;
        }
        let successor = this.getSuccessor(currentState, interaction);
        if (successor) {
            return successor;
        }
        successor = this.getSuccessor(this.stepDFA.startState, interaction);
        if (successor) {
            return successor;
        }
        return this.stepDFA.startState;
    }

    private getSuccessor(state: StepState, interaction: Interaction): StepState | undefined {
        if (! this.stepDFA) {
            return undefined;
        }
        if (this.stepDFA.transitions.has(state)) {
            const transition = this.stepDFA.transitions.get(state);
            if (!transition) {
                return undefined;
            }
            if (transition.has(interaction.getLabel())) {
                const destinationsByLabel = transition.get(interaction.getLabel());
                if (!destinationsByLabel) {
                    return undefined;
                }
                return destinationsByLabel[0];
            } else if (transition.has(interaction.toString())) {
                const destinationsByLabel = transition.get(interaction.toString());
                if (!destinationsByLabel) {
                    return undefined;
                }
                return destinationsByLabel[0];
            } else if (transition.has(transitionType.star)) {
                const destinationsByLabel = transition.get(transitionType.star);
                if (!destinationsByLabel) {
                    return undefined;
                }
                return destinationsByLabel[0];
            } else {
                return undefined;
            }
        } else {
            return undefined;
        }
    }

}
