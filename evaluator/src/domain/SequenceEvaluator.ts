import { generate } from "shortid";
import Action from "./Action";
import Interaction from "./Interaction";
import InteractionFactory from "./InteractionFactory";
import SequenceEvaluation from "./SequenceEvaluation";
import Step from "./Step";
import { transitionType } from "./StepState";

export default class SequenceEvaluator {

    public readonly id: string;
    public readonly webSiteId: string;
    public description: string;

    public step: Step | undefined;

    constructor(webSiteId: string, id?: string, description: string = "") {
        this.webSiteId = webSiteId;
        this.step = undefined;
        if (id !== undefined && id !== null) {
            this.id = id;
        } else {
            this.id = generate();
        }
        this.description = description;
    }

    public setStep(step: Step): void {
        if (step.expression && step.expression.length > 0) {
            this.step = step;
        }
    }

    public evaluate(sequence: Interaction[]): Promise<SequenceEvaluation> {
        return new Promise((resolve) => {
            const sequenceEvaluation = new SequenceEvaluation();

            const step = this.step;
            if (step) {
                const {
                    isAccepted,
                    continuingInteractions,
                    finishingInteractionList,
                    enteringInteractionList,
                } = this.evaluateStep(sequence, step);


                sequenceEvaluation.enteringInteractionList = enteringInteractionList;
                sequenceEvaluation.continuingActionList = continuingInteractions.filter((interaction) => interaction instanceof Action) as Action[];
                sequenceEvaluation.finishingInteractionList = finishingInteractionList;
                sequenceEvaluation.isAccepted = isAccepted;
            }
            resolve(sequenceEvaluation);
        });
    }

    private evaluateStep(sequence: Interaction[], step: Step): {
        isAccepted: boolean,
        enteringInteractionList: Interaction[],
        continuingInteractions: Interaction[],
        finishingInteractionList: Interaction[],
    } {
        if (!step.stepDFA) {
            return {
                isAccepted: true,
                enteringInteractionList: step.enteringInteractionList,
                continuingInteractions: [],
                finishingInteractionList: [],
            };
        }
        
        const state = step.followSequence(sequence);
        if (!state) {
            return {
                isAccepted: false,
                enteringInteractionList: step.enteringInteractionList,
                continuingInteractions: [],
                finishingInteractionList: [],
            };
        }

        const isAccepted = step.stepDFA.isFinalState(state);
        const interactions = step.stepDFA.transitions;
        const dest = interactions.get(state);
        if (dest === undefined) {
            throw new Error("destination should not be undefined")
        }
        const availableInteractionLabelList = Array.from(dest.keys());
        const availableInteractionList = availableInteractionLabelList.map((label) => InteractionFactory.parseInteraction(label));
            
        let enteringInteractionList: Interaction[] = [];
        let continuingInteractions: Interaction[] = [];
        const finishingInteractionList: Interaction[] = [];

        availableInteractionList.forEach((interaction) => {
            const transitions = step.stepDFA?.transitions.get(state);
            if (!transitions) {
                return;
            }
            else if (transitions.has(interaction.getLabel())) {
                const destinations = transitions.get(interaction.getLabel());
                if (destinations === undefined) {
                    return;
                }
                const hasTransitionsToFinalState = destinations.some((dest) => {
                    if (step.stepDFA === null) {
                        return false;
                    }
                    return step.stepDFA.isFinalState(dest)
                })
                if (hasTransitionsToFinalState) {
                    finishingInteractionList.push(interaction);
                }
            } else {
                const destinations = transitions.get(transitionType.star);
                 if (destinations !== undefined) {
                    if (destinations.some((dest) => step.stepDFA?.isFinalState(dest))) {
                        finishingInteractionList.push(interaction);
                    }
                 }
            }

        });
        const interactionList = availableInteractionList.filter((interaction) => 
                !finishingInteractionList.some((finishingInteraction) => finishingInteraction.toString() === interaction.toString()));
        if (state === step.stepDFA.startState) {
            enteringInteractionList = interactionList;
        } else {
            continuingInteractions = interactionList;
        }
        
        return {
            isAccepted,
            enteringInteractionList,
            continuingInteractions,
            finishingInteractionList,
        };
    }

}
