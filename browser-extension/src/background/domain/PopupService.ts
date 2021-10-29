import Evaluator from "./Evaluator";
import ExplorationEvaluation from "./ExplorationEvaluation";
import StateForPopup from "./StateForPopup";

export default interface PopupService {

    refresh(state: StateForPopup): Promise<void>;
    displayInvalidExploration(evaluation: ExplorationEvaluation | undefined, evaluator: Evaluator| undefined): Promise<void>;
}