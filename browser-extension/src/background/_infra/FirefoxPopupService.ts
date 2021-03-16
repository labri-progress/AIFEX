import PopupService from "../domain/PopupService";
import StateForPopup from "../domain/StateForPopup";
import {sendMessageToExtension} from "./FirefoxPromise"


export default class FirefoxPopupService implements PopupService {

    public displayInvalidExploration(): Promise<void> {
        const MESSAGE_KIND = "displayInvalidExploration";
        return sendMessageToExtension({}, MESSAGE_KIND);

    }

    public refresh(state: StateForPopup): Promise<void> {
        const MESSAGE_KIND = "refresh";
        return sendMessageToExtension(state, MESSAGE_KIND);
    }

}