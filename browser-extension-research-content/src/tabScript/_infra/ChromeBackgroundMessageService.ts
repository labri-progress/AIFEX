import State, { OverlayType } from "../domain/State";
import Action from "../domain/Action";
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
                        data.isActive)
                    return resolve(state)
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

}

