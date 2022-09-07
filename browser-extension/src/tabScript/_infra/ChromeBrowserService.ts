import State from "../domain/State";
import BrowserService from "../domain/BrowserService";

export default class ChromeBrowserService  implements BrowserService {

    addListenerToChangeInState(listener : (oldState: State, newState: State) => void) {
        chrome.storage.onChanged.addListener((changes, namespace) => {
            for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
                if (key === "AIFEX_STATE") {
                    listener(oldValue, newValue);
                    break;
                }
            }
        });
    }

    getStateFromStorage(): Promise<State> {
        return chrome.storage.local.get("AIFEX_STATE")
            .then( (result) => {
                return new State(result["AIFEX_STATE"]);
            });
    }
}

