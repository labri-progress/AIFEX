import Interface4TabScript from "../application/Interface4TabScript";
import ExtensionCommunicationService from "./ExtensionCommunicationService";

export default class HandlerOfMessageSentByTabScript {
    private _application : Interface4TabScript;

    constructor(application: Interface4TabScript) {
        this._application = application;
    }

    public attachCommunicationService(extensionCommunicationService : ExtensionCommunicationService): void {
        extensionCommunicationService.addOnMessageListener(this.handleMessage.bind(this));
    }


    private handleMessage(msg : any, sender : any, sendResponse : Function): boolean {
        switch (msg.kind) {
			case "getStateForTabScript": {
                console.log(`TabScript asks for ${msg.kind}`);
                let state = this._application.getStateForTabScript();
				sendResponse(state);
				return true;
            }
                
            case "pushAction": {
                console.log(`TabScript asks for ${msg.kind}`);
                const action = msg.action;
                this._application.processNewAction(action.prefix, action.suffix)
                .then(() => {
                    sendResponse("ok");
                })
                return true;
            }

            default : {
                //logger.debug(`${msg.kind} is not considered to come from tabscript`);
                return true;
            }

        }
    }
}