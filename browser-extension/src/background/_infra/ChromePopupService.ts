import PopupService from "../domain/PopupService";
import StateForPopup from "../domain/StateForPopup";
import {sendMessageToExtension} from "./ChromePromise"


export default class ChromePopupService implements PopupService {

    public refresh(state: StateForPopup): Promise<void> {
        const MESSAGE_KIND = "refresh";
        console.log(state)
        return sendMessageToExtension({state}, MESSAGE_KIND);
    }

}