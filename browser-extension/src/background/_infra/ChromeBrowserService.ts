
import State from "../domain/State";
import BrowserService from "../domain/BrowserService";
import { getCurrentWindow, takeScreenshot } from "./ChromePromise";
import { logger } from "../Logger";

export default class ChromeBrowserService implements BrowserService {

    constructor() {
    }

    getExtensionVesion(): string {
        return chrome.runtime.getManifest().version
    }

    takeScreenshot(): Promise<string> {
        return getCurrentWindow()
            .then((window: chrome.windows.Window) => {
                if (window && window.id) {
                    let windowId: number = window.id;
                    return takeScreenshot(windowId);
                } else {
                    return Promise.reject("No window found");
                }
            });
    }

    getStateFromStorage(): Promise<State> {
        logger.debug(`get state`);
        return chrome.storage.local.get("AIFEX_STATE")
            .then( (result) => {
                if (result  && result["AIFEX_STATE"]) {
                    logger.debug(`state: ${JSON.stringify(result["AIFEX_STATE"])}`);
                    return new State(result["AIFEX_STATE"]);
                } else {
                    return new State({});
                }
                
            });

    }

    setStateToStorage(state: State): Promise<void> {
        logger.debug(`set state`);
        return chrome.storage.local.set({"AIFEX_STATE": state});
    }

    openLongLiveTab(): Promise<any> {
        return chrome.tabs.create({url: 'bg.html'});
    }

    onExtensionDisconnect(listener : () => void) : void {
        chrome.runtime.connect().onDisconnect.addListener(listener)
    }

}
