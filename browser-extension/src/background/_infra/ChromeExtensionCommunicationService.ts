import ExtensionCommunicationService from "../_ui/ExtensionCommunicationService";

export default class ChromeExtensionCommunicationService implements ExtensionCommunicationService {
    addOnMessageListener(handler: (msg : any, sender : any, sendResponse : Function) => boolean) : void {
        chrome.runtime.onMessage.addListener(handler);
    }

}