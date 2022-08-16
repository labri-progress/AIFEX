import State from "../domain/State";
import BrowserService from "../domain/BrowserService";

const STATE_KEY = "state";

export default class ChromeBrowserService  implements BrowserService {
    getStateFromStorage(): Promise<State> {
        return chrome.storage.local.get("AIFEX_STATE")
            .then( (result) => {
                return result["AIFEX_STATE"];
            });
    }
}

