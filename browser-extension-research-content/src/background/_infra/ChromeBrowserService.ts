
import State from "../domain/State";
import BrowserService from "../domain/BrowserService";
import { getCurrentWindow, takeScreenshot } from "./ChromePromise";

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

    getStateFromStorage(): Promise<State | undefined> {
        return chrome.storage.local.get("AIFEX_STATE")
            .then( (result) => {
                return result["AIFEX_STATE"];
            });

    }

    setStateToStorage(state: State): Promise<void> {
        return chrome.storage.local.set({"AIFEX_STATE": state});
    }

    openLongLiveTab(): Promise<any> {
        return chrome.tabs.create({url: 'bg.html'});
    }

}
