import Interface4Background from "../application/Interface4Background";
import ExtensionCommunicationService from "./ExtensionCommunicationService";

export default class HandlerOfMessageSentByBackground  {

    private _tabScriptService : Interface4Background;

    constructor(tabScriptApplication: Interface4Background, ) {
        this._tabScriptService = tabScriptApplication;
    }

    attachCommunicationService(extensionCommunicationService : ExtensionCommunicationService): void {
        extensionCommunicationService.addOnMessageListener(this.handleMessage.bind(this));
    }

    handleMessage(msg : any, sender : any, sendResponse: Function) : boolean {
        console.log(`TabScript received message: ${msg.kind}`);
        switch (msg.kind) {
            case "explorationStarted":
                this._tabScriptService.explorationStarted();
                sendResponse("ok");
                return true;

            case "explorationStopped":
                this._tabScriptService.explorationStopped();
                sendResponse("ok");
                return true;

            case "checkRunning":
                sendResponse("ok");
                return true;

            default:
                console.log("unhandled message ", msg);
                sendResponse("ok");
                return true;
            }
    }
}