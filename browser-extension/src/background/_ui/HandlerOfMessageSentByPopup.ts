import Interface4Popup from "../application/Interface4Popup";
import ExtensionCommunicationService from "./ExtensionCommunicationService";

export default class HandlerOfMessageSentByPopup {
    private _application : Interface4Popup;

    constructor(application: Interface4Popup) {
        this._application = application;
    }

    public attachCommunicationService(extensionCommunicationService : ExtensionCommunicationService): void {
        extensionCommunicationService.addOnMessageListener(this.handleMessage.bind(this));
    }

    private handleMessage(msg : any, sender : any, sendResponse : Function): boolean {
        switch (msg.kind) {

            case "checkDeprecated": {
                if (!msg.url) {
                    sendResponse({error: "URL is missing"});
                } else {
                    try {
                        const connexionURL = new URL(msg.url);
                        this._application.makeCompatibilityCheck(connexionURL.origin)
                        .then((compatibilityCheck) => {
                            sendResponse(compatibilityCheck);
                        })
                        .catch((error) => {
                            sendResponse({error});
                        });
                    } catch (error) {
                        sendResponse({error});
                    }
                }
                return true;
			}

            case "connect": {
                console.log(`Popup asks for ${msg.kind}`);
                if (!msg.url) {
                    console.log(`connection refused`);
                    sendResponse({error: "URL is missing"});
                    return true;
                } else {
                    try {
                        const CONNECTION_URL = new URL(msg.url);
                        const sessionId = CONNECTION_URL.searchParams.get('sessionId');
                        const modelId = CONNECTION_URL.searchParams.get('modelId');
                        const serverURL = CONNECTION_URL.origin;
                        console.log(`sessionId=${sessionId}, modelId=${modelId}, serverURL=${serverURL}`)
                        if (!sessionId || !modelId || ! serverURL) {
                            console.log(`URL is invalid`);
                            sendResponse({error: "URL is invalid"});
                            return true;
                        }
                        this._application
                            .connect(serverURL, sessionId, modelId)
                            .then((connexionResult) => {
                                console.log(`connection : ${connexionResult}`);
                                sendResponse(connexionResult);
                            })
                            .catch((error: string) => {
                                console.log("Connection failed", new Error(error))
                                sendResponse({error:"Connection failed"})
                        });
                    } catch(error) {
                        console.log("Invalid URL", new Error("url"))
                        sendResponse({error})
                    }
                }
                return true;
            }

            case "startExploration": {
                console.log(`Popup asks for ${msg.kind}`);
                this._application
                    .startExploration()
                    .then(() => {
                        console.log(`start exploration`);
                        sendResponse("started");
                    })
                    .catch((error : Error) => {
                        console.log("popup asks to startExploration", error);
                        sendResponse({error});
                    });
                return true;
            }

            case "stopExploration": {
                console.log(`Popup asks for ${msg.kind}`);
                this._application
                    .stopExploration()
                    .then(() => {
                        console.log('stopped');
                        sendResponse("stopped");
                    })
                    .catch((error) => {
                        console.log("popup asks to stopExploration", error);
                        sendResponse({error});
                    });
                return true;
            }

            default : {
                //console.log(`${msg.kind} is not considered to come from popup`);
                return true;
            }

        }
    }



}