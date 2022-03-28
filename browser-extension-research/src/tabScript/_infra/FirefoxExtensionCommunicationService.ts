import ExtensionCommunicationService from "../_ui/ExtensionCommunicationService";

export default class FirefoxExtensionCommunicationService implements ExtensionCommunicationService {

    addOnMessageListener(handler: (msg : any, sender : any, sendResponse: Function) => boolean) : void {
        browser.runtime.onMessage.addListener(handler);
    }

}