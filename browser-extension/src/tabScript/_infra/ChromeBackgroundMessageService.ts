import State, { OverlayType } from "../domain/State";
import Comment from "../domain/Comment";
import Action from "../domain/Action";
import ExplorationEvaluation from "../domain/ExplorationEvaluation";
import BackgroundService from "../domain/BackgroundService";
import Question from "../domain/Question";
import { Step } from "../domain/Step";


export default class ChromeBackgroundMessageService  implements BackgroundService{

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
                overlayType: OverlayType
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
                        data.overlayType);
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
                enteringInteractionList: string[];
                continuingActionList: string[];
                finishingInteractionList: string[];
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
                    data.enteringInteractionList.map(action => Action.parseAction(action)),
                    data.continuingActionList.map(action => Action.parseAction(action)),
                    data.finishingInteractionList.map(action => Action.parseAction(action)),
                ));
            })
        })
    }

    setUserViewPosition(newPosition: {x: number, y:number}): Promise<void> {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                kind: 'setPopupCommentPosition',
                popupCommentPosition: newPosition
              }, {}, () => {
                const error = chrome.runtime.lastError;
                if (error) {
                    return reject(error);
                } else {
                    return resolve();
                }
            });
        })
    }

    upComment(comment: Comment): Promise<void> {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                kind: 'upComment',
                type: comment.type,
                value: comment.note
            }, {}, () => {
                const error = chrome.runtime.lastError;
                if (error) {
                    return reject(error);
                } else {
                    return resolve();
                }
            });
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

    sendAnswer(question: Question, value: boolean): Promise<void>{
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                question,
                value,
                kind: 'pushAnswer'
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

