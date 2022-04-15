
import BrowserService from "../domain/BrowserService";
import { getCurrentWindow, takeScreenshot } from "./ChromePromise";
const DEFAULT_WINDOW_OPTIONS = { url: 'https://www.aifex.fr' };
const DEFAULT_TAB_OPTIONS = {};

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

    getFromStorage(key: string): Promise<any> {
        return new Promise((res, rej) => {
            chrome.storage.local.get([key], (result) => {
                res(result.key);
            });
        });
    }
    setToStorage(key: string, value: any): Promise<void> {
        return new Promise((res, rej) => {
            let keyVal : any = {};
            keyVal[key] = value;
            chrome.storage.local.set(keyVal, () => {
                res();
            });
        });
    }

    openLongLiveTab(): Promise<any> {
        return chrome.tabs.create({url: 'bg.html'});
    }


}
