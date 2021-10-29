import State, { OverlayType } from "../domain/State";
import Comment from "../domain/Comment";
import Action from "../domain/Action";
import ExplorationEvaluation from "../domain/ExplorationEvaluation";
import BackgroundService from "../domain/BackgroundService";


export default class ChromeBackgroundMessageService  implements BackgroundService {

    getState(): Promise<State> {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                kind: 'getStateForTabScript'
            }, {}, (data: {
                commentsUp: string[],
                displayUserView: boolean,
                isActive: boolean,
                isRecording: boolean,
                popupCommentPosition: {x: string, y: string},
                webSite: any,
                overlayType: OverlayType,
                exploration: any
            }) => {
                const error = chrome.runtime.lastError;
                if (error) {
                    return reject(error);
                } else {
                    const isActive = data.isRecording ? true : false;
                    let commentsUp : Comment[] = []
                    if (data.commentsUp && Array.isArray(data.commentsUp)) {
                        commentsUp = data.commentsUp.map((commentText) => Comment.parseComment(commentText));
                    }
                    const state = new State(
                        commentsUp,
                        data.displayUserView,
                        isActive,
                        data.webSite,
                        data.popupCommentPosition,
                        data.overlayType,
                        data.exploration);
                    return resolve(state)
                }
            });
        })
    }

    getActionList(): Promise<Action[]> {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                kind: 'getProbabilityMap'
            }, {}, data => {
                const error = chrome.runtime.lastError;
                if (error) {
                    return reject(error);
                }
                if (data?.probabilityMap) {
                    const actionList = [];
                    for (const [actionName, probability] of data.probabilityMap) {
                        const action = Action.parseAction(actionName);
                        action.probability = probability;
                        actionList.push(action)
                    }
                    return resolve(actionList);
                } else {
                    return resolve([]);
                }

            })
        })
    }

    getExplorationEvaluation(): Promise<ExplorationEvaluation | undefined> {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                kind: 'getEvaluation'
            }, {}, (data: {
                isAccepted: boolean,
                nextActionList: string[];
            }) => {
                const error = chrome.runtime.lastError;
                if (error) {
                    return reject(error);
                }
                if (!data) {
                    return resolve(undefined);
                }
                resolve(new ExplorationEvaluation(
                    data.isAccepted,
                    data.nextActionList.map(action => Action.parseAction(action)),
                ));
            })
        })
    }

    sendAction(action: Action): Promise<void> {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                action,
                kind: 'pushAction'
            }, {}, () => {
                const error = chrome.runtime.lastError;
                    if (error) {
                        return reject(error);
                    } else {
                        return resolve();
                    }
            })
        })
    }

}

