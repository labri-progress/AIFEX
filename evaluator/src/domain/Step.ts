
import Action, { ActionLabel } from "./Action";
import StepState from "./StepState";

export default interface Step {
    expression: string;
    isEmpty:boolean;

    isCompleted(state: StepState): boolean;
    
    firstActionList: Action[];
    nextTransitionMap(state: StepState): Map<ActionLabel, StepState>;
    followSequence(sequence: Action[]): StepState | null;
}
