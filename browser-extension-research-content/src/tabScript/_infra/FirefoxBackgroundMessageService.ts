import State from "../domain/State";
import Action from "../domain/Action";
import BackgroundService from "../domain/BackgroundService";


export default class FirefoxBackgroundMessageService  implements BackgroundService{

    getState(): Promise<State> {
        return browser.runtime.sendMessage({
                kind: 'getStateForTabScript'
            })
            .then ((data: {
                isActive: boolean
            }) => {
                const state = new State(
                    data.isActive);
                    
                return state;
            });
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

