import Interface4TabScript from "../application/Interface4TabScript";
import Question from "../domain/Question";
import ExtensionCommunicationService from "./ExtensionCommunicationService";
import {logger} from "../framework/Logger";

export default class HandlerOfMessageSentByTabScript {
    private _application : Interface4TabScript;

    constructor(application: Interface4TabScript) {
        this._application = application;
    }

    public attachCommunicationService(extensionCommunicationService : ExtensionCommunicationService): void {
        extensionCommunicationService.addOnMessageListener(this.handleMessage.bind(this));
    }


    private handleMessage(msg : any, sender : any, sendResponse : Function): boolean {
        logger.info(`TabScript asks for ${msg.kind}`);
        switch (msg.kind) {
			case "getStateForTabScript": {
                let state = this._application.getStateForTabScript();
				sendResponse(state);
				return true;
            }

            case "getProbabilityMap": {
                let probabiliytMap = this._application.getProbabilityMap();
                sendResponse({
                    probabilityMap: JSON.parse(JSON.stringify(Array.from(probabiliytMap)))
                });
                return true;
            }

            case "getCommentDistributions": {
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
                const action = msg.action;
                this._application.processNewAction(action.prefix, action.suffix)
                .then(() => {
                    sendResponse("ok");
                })
                return true;
            }

            case "setPopupCommentPosition": {
                this._application.setPopupCommentPosition(msg.popupCommentPosition);
                sendResponse("ok");
                return true;
            }

            case "pushAnswer": {
                const question = new Question(msg.question.text);
                // logger.info(msg.value, msg.value === true)
                this._application.addAnswerToExploration(question, msg.value);
                sendResponse("ok");
                return true;
            }

            default : {
                logger.debug(`${msg.kind} is not considered to come from tabscript`);
                return true;
            }

        }
    }
}