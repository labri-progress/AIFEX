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
            case "changePopupPageKind": {
                console.log(`Popup asks for ${msg.kind}`);
                if (!msg.popupPageKind) {
                    console.log(`no page`);
                    sendResponse({error: "page is missing"});
                } else {
                    this._application.changePopupPageKind(msg.popupPageKind);
                    sendResponse({message: "page changed"});
                }
                return true;
            }

            case "checkDeprecated": {
                console.log(`Popup asks for ${msg.kind}`);
                if (!msg.url) {
                    console.log(`cannot check plugin version`);
                    sendResponse({error: "URL is missing"});
                } else {
                    try {
                        const connexionURL = new URL(msg.url);
                        this._application.makeCompatibilityCheck(connexionURL.origin)
                        .then((compatibilityCheck) => {
                            console.log(`compatibilityCheck: ${JSON.stringify(compatibilityCheck)}`);
                            sendResponse(compatibilityCheck);
                        })
                        .catch((error) => {
                            console.log("popup asks for checkDeprecated", error);
                            sendResponse({error});
                        });
                    } catch (error) {
                        console.log("wrong URL",new Error("url"));
                        sendResponse({error});
                    }
                }
                return true;
			}

			case "getStateForPopup": {
                console.log(`Popup asks for ${msg.kind}`);
                let state = this._application.getStateForPopup();
                console.log(`state is returned`);
				sendResponse(state);
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

            case "disconnect": {
                console.log(`Popup asks for ${msg.kind}`);
                this._application.disconnect();
                sendResponse("ok");
                return true;
            }

            case "startExploration": {
                console.log(`Popup asks for ${msg.kind}`);
                this._application
                    .startExploration()
                    .then(() => {
                        console.log(`start exploration`);
                        sendResponse(this._application.getStateForPopup());
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
                        sendResponse(this._application.getStateForPopup());
                    })
                    .catch((error) => {
                        console.log("popup asks to stopExploration", error);
                        sendResponse({error});
                    });
                return true;
            }

            case "changeTesterName": {
                console.log(`Popup asks for ${msg.kind}`);
                this._application.changeTesterName(msg.testerName)
                    .then(() => {
                        sendResponse(this._application.getStateForPopup());
                    }).catch((error: Error) => {
                        console.log("popup asks to changeTesterName",error);
                        sendResponse({error});
                    });
				return true;
            }


            case "setTakeAScreenshotByAction" : {
                console.log(`Popup asks for ${msg.kind}`);
                this._application.setTakeAsScreenshotByAction(msg.takeAScreenshotByAction);
                sendResponse("ok");
                return true;
            }

            case "submitConfig": {
                console.log(`Popup asks for ${msg.kind}`);
                this._application.submitConfig(msg.testerName);
                sendResponse("ok");
                return true;
            }

            default : {
                //console.log(`${msg.kind} is not considered to come from popup`);
                return true;
            }

        }
    }



}