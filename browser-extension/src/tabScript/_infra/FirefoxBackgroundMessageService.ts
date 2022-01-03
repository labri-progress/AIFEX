import State, { OverlayType } from "../domain/State";
import Comment from "../domain/Comment";
import Action from "../domain/Action";
import ExplorationEvaluation from "../domain/ExplorationEvaluation";
import BackgroundService from "../domain/BackgroundService";


export default class FirefoxBackgroundMessageService  implements BackgroundService{

    getState(): Promise<State> {
        return browser.runtime.sendMessage({
                kind: 'getStateForTabScript'
            })
            .then ((data: {
                commentsUp: string[],
                isDisplayingComments: boolean,
                isActive: boolean,
                isRecording: boolean,
                popupCommentPosition: {x: string, y: string},
                webSite: any,
                overlayType: OverlayType,
                exploration: any,
                showProbabilityPopup: boolean
            }) => {
                const isActive = data.isRecording ? true : false;
                let commentsUp : Comment[] = []
                if (data.commentsUp && Array.isArray(data.commentsUp)) {
                    commentsUp = data.commentsUp.map((commentText) => Comment.parseComment(commentText));
                }
                const state = new State(
                    commentsUp,
                    data.isDisplayingComments,
                    isActive,
                    data.webSite,
                    data.popupCommentPosition,
                    data.overlayType,
                    data.exploration,
                    data.showProbabilityPopup);
                    
                return state;
            });
    }

    getActionList(): Promise<Action[]> {
        return browser.runtime.sendMessage({
                kind: 'getProbabilityMap'
            })
            .then( data => {
                if (data?.probabilityMap) {
                    const actionList = [];
                    for (const [actionName, probability] of data.probabilityMap) {
                        const action = Action.parseAction(actionName);
                        action.probability = probability;
                        actionList.push(action)
                    }
                    return actionList;
                } else {
                    return [];
                }
            });
    }

    getExplorationEvaluation(): Promise<ExplorationEvaluation | undefined> {
        return browser.runtime.sendMessage({
                kind: 'getEvaluation'
            })
            .then((data: {
                isAccepted: boolean,
                nextActionList: string[]
            }) => {
                if (!data) {
                    return;
                }
                return new ExplorationEvaluation(
                    data.isAccepted,
                    data.nextActionList.map(action => Action.parseAction(action)),
                );
            })
    }

    sendAction(action: Action): Promise<void> {
        return browser.runtime.sendMessage({
                action,
                kind: 'pushAction'
            }).then((response) => {
                if (!response.error) {
                    return Promise.resolve();
                }
            });
    }

}

