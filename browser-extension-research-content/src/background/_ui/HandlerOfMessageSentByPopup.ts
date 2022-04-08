import Interface4Popup from "../application/Interface4Popup";
import ExtensionCommunicationService from "./ExtensionCommunicationService";
import {logger} from "../Logger";

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
                logger.info(`Popup asks for ${msg.kind}`);
                if (!msg.popupPageKind) {
                    logger.debug(`no page`);
                    sendResponse({error: "page is missing"});
                } else {
                    this._application.changePopupPageKind(msg.popupPageKind);
                    sendResponse({message: "page changed"});
                }
                return true;
            }

            case "checkDeprecated": {
                logger.info(`Popup asks for ${msg.kind}`);
                if (!msg.url) {
                    logger.debug(`cannot check plugin version`);
                    sendResponse({error: "URL is missing"});
                } else {
                    try {
                        const connexionURL = new URL(msg.url);
                        this._application.makeCompatibilityCheck(connexionURL.origin)
                        .then((compatibilityCheck) => {
                            logger.debug(`compatibilityCheck: ${JSON.stringify(compatibilityCheck)}`);
                            sendResponse(compatibilityCheck);
                        })
                        .catch((error) => {
                            logger.error("popup asks for checkDeprecated", error);
                            sendResponse({error});
                        });
                    } catch (error) {
                        logger.error("wrong URL",new Error("url"));
                        sendResponse({error});
                    }
                }
                return true;
			}

			case "getStateForPopup": {
                logger.info(`Popup asks for ${msg.kind}`);
                let state = this._application.getStateForPopup();
                logger.debug(`state is returned`);
				sendResponse(state);
				return true;
			}

            case "linkServer": {
                logger.info(`Popup asks for ${msg.kind}`);
                this._application.linkServer(msg.url)
                    .then((result) => {
                        logger.debug(`linkServer: ${result}`);
                        sendResponse(result);
                    })
                    .catch((error) => {
                        sendResponse({error});
                    });
                return true;
            }

            case "signin": {
                logger.info(`Popup asks for ${msg.kind}`);
                this._application.signin(msg.username, msg.password)
                    .then((result) => {
                        if (result === "SignedIn") {                            
                            sendResponse({message:result});
                        } else {
                            sendResponse({error:result});
                        }
                    })
                return true;
            }

            case "connect": {
                logger.info(`Popup asks for ${msg.kind}`);
                if (!msg.url) {
                    logger.debug(`connection refused`);
                    sendResponse({error: "URL is missing"});
                    return true;
                } else {
                    try {
                        const CONNECTION_URL = new URL(msg.url);
                        const sessionId = CONNECTION_URL.searchParams.get('sessionId');
                        const modelId = CONNECTION_URL.searchParams.get('modelId');
                        const serverURL = CONNECTION_URL.origin;
                        logger.debug(`sessionId=${sessionId}, modelId=${modelId}, serverURL=${serverURL}`)
                        if (!sessionId || !modelId || ! serverURL) {
                            logger.debug(`URL is invalid`);
                            sendResponse({error: "URL is invalid"});
                            return true;
                        }
                        this._application
                            .connect(serverURL, sessionId, modelId)
                            .then((connexionResult) => {
                                logger.debug(`connection : ${connexionResult}`);
                                sendResponse(connexionResult);
                            })
                            .catch((error: string) => {
                                logger.error("Connection failed", new Error(error))
                                sendResponse({error:"Connection failed"})
                        });
                    } catch(error) {
                        logger.error("Invalid URL", new Error("url"))
                        sendResponse({error})
                    }
                }
                return true;
            }

            case "disconnect": {
                logger.info(`Popup asks for ${msg.kind}`);
                this._application
                    .disconnect()
                    .then(() => {
                        sendResponse("ok");
                    })
                    .catch((error) => {
                        logger.error("popup asks to disconnect",error);
                        sendResponse({ error });
                    });
                return true;
            }

            case "startExploration": {
                logger.info(`Popup asks for ${msg.kind}`);
                this._application
                    .startExploration()
                    .then(() => {
                        logger.info(`start exploration`);
                        sendResponse(this._application.getStateForPopup());
                    })
                    .catch((error : Error) => {
                        logger.error("popup asks to startExploration", error);
                        sendResponse({error});
                    });
                return true;
            }

            case "stopExploration": {
                logger.info(`Popup asks for ${msg.kind}`);
                this._application
                    .stopExploration()
                    .then(() => {
                        logger.info('stopped');
                        sendResponse(this._application.getStateForPopup());
                    })
                    .catch((error) => {
                        logger.error("popup asks to stopExploration", error);
                        sendResponse({error});
                    });
                return true;
            }

            case "removeExploration": {
                logger.info(`Popup asks for ${msg.kind}`);
                this._application
                    .removeExploration()
                    .then(() => {
                        sendResponse(this._application.getStateForPopup());
                    }).catch((error) => {
                        logger.error("popup asks to removeExploration",error);
                        sendResponse({error});
                    });
                return true;
            }

            case "changeTesterName": {
                logger.info(`Popup asks for ${msg.kind}`);
                this._application.changeTesterName(msg.testerName)
                    .then(() => {
                        sendResponse(this._application.getStateForPopup());
                    }).catch((error: Error) => {
                        logger.error("popup asks to changeTesterName",error);
                        sendResponse({error});
                    });
				return true;
            }

            case "setCreateNewWindowOnConnect": {
                logger.info(`Popup asks for ${msg.kind}`);
                this._application.setShouldCreateNewWindowsOnConnect(msg.shouldCreateNewWindowOnConnect);
                sendResponse(this._application.getStateForPopup());
                return true;
            }

            case "setCloseWindowOnConnect": {
                logger.info(`Popup asks for ${msg.kind}`);
                this._application.setShouldCloseWindowOnDisconnect(msg.shouldCloseWindowOnDisconnect);
                sendResponse(this._application.getStateForPopup());
                return true;
            }

            case "setOpenPrivateWindow": {
                logger.info(`Popup asks for ${msg.kind}`);            
                this._application.setShouldOpenPrivateWindow(msg.shouldOpenPrivateWindows);
                sendResponse(this._application.getStateForPopup());
                return true;
            }
                
            case "takeScreenshot": {
                logger.info(`Popup asks for ${msg.kind}`);
                this._application.takeScreenShot();
                sendResponse("ok");
                return true;
            }

            case "drawAttention": {
                logger.info(`Popup asks for ${msg.kind}`);
                this._application.drawAttention();
                sendResponse("ok");
                return true;
            }

            case "setRecordMediaStatus" : {
                logger.info(`Popup asks for ${msg.kind}`);
                this._application.setRecordMedia(msg.recordMediaStatus)
                .then(() => {
                    sendResponse("ok");
                })
                .catch( (error: Error) => {
                    logger.error("Failed to set media record", new Error("Failed to set media record"));
                    sendResponse({error});
                })
                return true;
            }

            case "setTakeAScreenshotByAction" : {
                logger.info(`Popup asks for ${msg.kind}`);
                this._application.setTakeAsScreenshotByAction(msg.takeAScreenshotByAction);
                sendResponse("ok");
                return true;
            }

            case "toggleDetachPopup": {
                logger.info(`Popup asks for ${msg.kind}`);
                this._application.toggleDetachPopup()
                .then(() => {
                    sendResponse("ok");
                })
                .catch((error) => {
                    logger.error("popup asks to toggleDetachPopup",error)
                    sendResponse({error});
                })
                return true;
            }

            case "showConfig": {
                logger.info(`Popup asks for ${msg.kind}`);
                this._application.showConfig();
                sendResponse("ok");
                return true;
            }

            case "submitConfig": {
                logger.info(`Popup asks for ${msg.kind}`);
                this._application.submitConfig(msg.testerName, msg.shouldCreateNewWindowsOnConnect, msg.shouldCloseWindowOnDisconnect, msg.shouldOpenPrivateWindows, msg.showProbabilityPopup);
                sendResponse("ok");
                return true;
            }

            case "cancelConfig": {
                logger.info(`Popup asks for ${msg.kind}`);
                this._application.cancelConfig();
                sendResponse("ok");
                return true;
            }

            default : {
                //logger.debug(`${msg.kind} is not considered to come from popup`);
                return true;
            }

        }
    }



}