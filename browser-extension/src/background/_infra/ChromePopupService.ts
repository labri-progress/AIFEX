import Evaluator from "../domain/Evaluator";
import ExplorationEvaluation from "../domain/ExplorationEvaluation";
import PopupService from "../domain/PopupService";
import StateForPopup from "../domain/StateForPopup";
import {sendMessageToPopup} from "./ChromePromise"


export default class ChromePopupService implements PopupService {
    
    displayInvalidExploration(evaluation: ExplorationEvaluation, evaluator: Evaluator): Promise<void> {
        const MESSAGE_KIND = "displayInvalidExploration";
        return sendMessageToPopup({
            evaluation,
            evaluator
        }, MESSAGE_KIND);
    }

    refresh(state: StateForPopup): Promise<void> {
        const MESSAGE_KIND = "refresh";
        return sendMessageToPopup({state}, MESSAGE_KIND).catch(error => {
            if (error.message.includes("Could not establish connection. Receiving end does not exist")) {
                return;
            }
            throw error;
        });
    }

}