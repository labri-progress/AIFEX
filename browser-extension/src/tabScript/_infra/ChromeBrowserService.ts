import State from "../domain/State";
import BrowserService from "../domain/BrowserService";

export default class ChromeBrowserService  implements BrowserService {

    addListenerToChangeInState(listener : (oldState: State, newState: State) => void) {
        chrome.storage.onChanged.addListener((changes, namespace) => {
            for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
                console.log('change');
                if (key === "AIFEX_STATE") {
                    console.log('aifex');
                    console.log(oldValue);
                    console.log(newValue);
                    listener(oldValue, newValue);
                }
            }
        });
    }

    getStateFromStorage(): Promise<State> {
        return chrome.storage.local.get("AIFEX_STATE")
            .then( (result) => {
                return result["AIFEX_STATE"];
            });
    }
}

