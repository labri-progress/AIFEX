import Interface4TabScript from "../application/Interface4TabScript";
import Question from "../domain/Question";
import ExtensionCommunicationService from "./ExtensionCommunicationService";
import {logger} from "../Logger";

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
                logger.info(`TabScript asks for ${msg.kind}`);
                let state = this._application.getStateForTabScript();
				sendResponse(state);
				return true;
            }

            case "getProbabilityMap": {
                logger.info(`TabScript asks for ${msg.kind}`);
                let probabiliytMap = this._application.getProbabilityMap();
                sendResponse({
                    probabilityMap: JSON.parse(JSON.stringify(Array.from(probabiliytMap)))
                });
                return true;
            }

            case "getCommentDistributions": {
                logger.info(`TabScript asks for ${msg.kind}`);
                let distributions = this._application.getCommentDistributions();
                let commentDistributionList = distributions.map(dist => {
                    return {
                        comment : dist.comment,
                        distributions : dist.distributions
                    }
                });
                sendResponse({
                    commentDistributionList: JSON.parse(JSON.stringify(commentDistributionList))
                });
                return true;
            }

            case "getEvaluation":
                logger.info(`TabScript asks for ${msg.kind}`);
                let explorationEvaluation = this._application.getExplorationEvaluation();
                if (explorationEvaluation) {
                    sendResponse({
                        isAccepted: explorationEvaluation.isAccepted,
                        enteringInteractionList: explorationEvaluation.enteringInteractionList.map(action => action.toString()),
                        continuingActionList: explorationEvaluation.continuingActionList.map(action => action.toString()),
                        finishingInteractionList: explorationEvaluation.finishingInteractionList.map(action => action.toString()),
                    });
                    return true;
                } else {
                    sendResponse();
                    return true;
                }
                
            case "pushAction": {
                logger.info(`TabScript asks for ${msg.kind}`);
                const action = msg.action;
                this._application.processNewAction(action.prefix, action.suffix)
                .then(() => {
                    sendResponse("ok");
                })
                return true;
            }

            case "setPopupCommentPosition": {
                logger.info(`TabScript asks for ${msg.kind}`);
                this._application.setPopupCommentPosition(msg.popupCommentPosition);
                sendResponse("ok");
                return true;
            }

            case "pushAnswer": {
                logger.info(`TabScript asks for ${msg.kind}`);
                const question = new Question(msg.question.text);
                // logger.info(msg.value, msg.value === true)
                this._application.addAnswerToExploration(question, msg.value);
                sendResponse("ok");
                return true;
            }

            default : {
                //logger.debug(`${msg.kind} is not considered to come from tabscript`);
                return true;
            }

        }
    }
}