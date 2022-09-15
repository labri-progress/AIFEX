import Interface4Popup from "../application/Interface4Popup";
import { logger } from "../Logger";
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
                logger.debug(`Popup asks for ${msg.kind}`);
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

            case "startExploration": {
                logger.info(`Popup asks for ${msg.kind}`);
                this._application
                    .startExploration()
                    .then(() => {
                        logger.debug(`start exploration`);
                        sendResponse("started");
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
                        logger.debug('stopped');
                        sendResponse("stopped");
                    })
                    .catch((error) => {
                        logger.error("popup asks to stopExploration", error);
                        sendResponse({error});
                    });
                return true;
            }

            case "pushObservation": {
                logger.info(`Popup asks for ${msg.kind}`);
                const { type, value } = msg;
                this._application.processNewObservation(type, value)
                .then(() => {
                    sendResponse("ok");
                })
                .catch((error) => {
                    logger.error("popup asks to pushObservation", error);
                    sendResponse({error});
                });
                return true;
                
            }

            default : {
                return true;
            }

        }
    }



}