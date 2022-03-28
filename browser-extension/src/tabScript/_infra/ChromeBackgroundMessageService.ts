import State, { OverlayType } from "../domain/State";
import Observation from "../domain/Observation";
import Action from "../domain/Action";
import ExplorationEvaluation from "../domain/ExplorationEvaluation";
import BackgroundService from "../domain/BackgroundService";


export default class ChromeBackgroundMessageService  implements BackgroundService {

    getState(): Promise<State> {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                kind: 'getStateForTabScript'
            }, {}, (data: {
                isActive: boolean,
                webSite: any,
                overlayType: OverlayType,
                showProbabilityPopup: boolean
            }) => {
                const error = chrome.runtime.lastError;
                if (error) {
                    return reject(error);
                } else {
                    const state = new State(
                        data.isActive,
                        data.overlayType,
                        data.showProbabilityPopup,
                        data.webSite)
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

