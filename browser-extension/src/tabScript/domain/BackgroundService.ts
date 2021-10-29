import State from "./State";
import Action from "./Action";
import ExplorationEvaluation from "./ExplorationEvaluation";

export default interface BackgroundService {
    getExplorationEvaluation(): Promise<ExplorationEvaluation | undefined>;
    getState(): Promise<State>;
    getActionList(): Promise<Action[]>;
    sendAction(action: Action): Promise<void>;
}