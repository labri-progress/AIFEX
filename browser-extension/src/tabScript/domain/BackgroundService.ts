import State from "./State";
import Comment from "./Comment";
import Action from "./Action";
import ExplorationEvaluation from "./ExplorationEvaluation";

export default interface BackgroundService {
    getExplorationEvaluation(): Promise<ExplorationEvaluation | undefined>;
    getState(): Promise<State>;
    getActionList(): Promise<Action[]>;
    setUserViewPosition(newPosition: {x: number, y:number}): void;
    upComment(comment: Comment): Promise<void>;
    sendAction(action: Action): Promise<void>;
}