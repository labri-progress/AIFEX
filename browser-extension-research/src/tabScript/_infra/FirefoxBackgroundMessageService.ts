import State, { OverlayType } from "../domain/State";
import Observation from "../domain/Observation";
import Action from "../domain/Action";
import ExplorationEvaluation from "../domain/ExplorationEvaluation";
import BackgroundService from "../domain/BackgroundService";
import WebSite from "../../background/domain/Website";


export default class FirefoxBackgroundMessageService  implements BackgroundService{

    getState(): Promise<State> {
        return browser.runtime.sendMessage({
                kind: 'getStateForTabScript'
            })
            .then ((data: {
                isActive: boolean,
                webSite: WebSite,
                overlayType: OverlayType,
                showProbabilityPopup: boolean
            }) => {
                const state = new State(
                    data.isActive,
                    data.overlayType,
                    data.showProbabilityPopup,
                    data.webSite);
                    
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

