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
        logger.info(`Popup asks for ${msg.kind}`);
        switch (msg.kind) {
            case "checkDeprecated": {
                if (!msg.url) {
                    logger.debug(`cannot check plugin version`);
                    sendResponse({error: "URL is missing"});
                    return true;
                } else {
                    this._application.makeCompatibilityCheck(msg.url)
                        .then((compatibilityCheck) => {
                            logger.debug(`compatibilityCheck: ${compatibilityCheck}`);
                            sendResponse(compatibilityCheck);
                        })
                        .catch((error) => {
                            logger.error("popup asks for checkDeprecated", error);
                            sendResponse({error});
                        });
                    return true;
                }
			}

			case "getStateForPopup": {
                let state = this._application.getStateForPopup();
                logger.debug(`state is returned`);
				sendResponse(state);
				return true;
			}

            case "linkServer": {
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
                if (!msg.url) {
                    logger.debug(`connection refused`);
                    sendResponse({error: "URL is missing"});
                    return true;
                }
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
                    .then(() => {
                        logger.debug(`connection accepted`);
                        sendResponse("ok");
                    })
                    .catch((error: string) => {
                        if (error === "session not found" || error === "model not found") {
                            logger.warn(error);
                        } else {
                            logger.error("Connection failed", new Error(error))
                        }
                        sendResponse({error: "Connection failed"})
                });
                return true;
            }

            case "disconnect": {
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

            case "reloadWebSite": {
                this._application
                    .reloadWebsite()
                    .then(() => {
                        sendResponse("ok");
                    })
                    .catch((error) => {
                        logger.error("popup asks to reloadWebSite",error);
                        sendResponse({error});
                    });
                return true;
            }

            case "startExploration": {
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
                this._application.setShouldCreateNewWindowsOnConnect(msg.shouldCreateNewWindowOnConnect);
                sendResponse(this._application.getStateForPopup());
                return true;
            }

            case "setCloseWindowOnConnect": {
                this._application.setShouldCloseWindowOnDisconnect(msg.shouldCloseWindowOnDisconnect);
                sendResponse(this._application.getStateForPopup());
                return true;
            }

            case "restartExploration": {
                this._application
                .restartExploration()
                .then(() => {
                    sendResponse(this._application.getStateForPopup());
                })
                .catch((error) => {
                    logger.error("popup asks to restartExploration",error);
                    sendResponse({error});
                });
                return true;
            }

            case "pushComment": {
                const { type, value } = msg;
                this._application.addCommentToExploration(type, value);
                sendResponse("ok");
                return true;
            }

            case "upComment": {
                this._application.upComment(msg.type, msg.value);
                sendResponse("ok");
                return true;
            }
                
            case "takeScreenshot": {
                this._application.takeScreenShot();
                sendResponse("ok");
                return true;
            }

            case "drawAttention": {
                this._application.drawAttention();
                sendResponse("ok");
                return true;
            }

            case "setRecordMediaStatus" : {
                this._application.setRecordMedia(msg.recordMediaStatus)
                .then(() => {
                    sendResponse("ok");
                })
                .catch( (error: Error) => {
                    logger.error("Failed to set media record", error);
                    sendResponse({error});
                })
                return true;
            }

            case "toggleDetachPopup": {
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

            default : {
                logger.debug(`${msg.kind} is not considered to come from popup`);
                return true;
            }

        }
    }



}