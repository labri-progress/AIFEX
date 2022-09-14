import State from "../domain/State";
import BrowserService from "../domain/BrowserService";

export default class ChromeBrowserService  implements BrowserService {

    addListenerToChangeInState(listener : (oldState: State | undefined, newState: State | undefined) => void) {
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
            .then( (values) => {
                if (values && values["AIFEX_STATE"]) {
                    return new State(values["AIFEX_STATE"]);
                } else {
                    return new State({});
                }
            });
    }
}

