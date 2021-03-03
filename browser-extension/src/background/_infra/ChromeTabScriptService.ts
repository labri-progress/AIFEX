import StateForTabScript from "../domain/StateForTabScript";
import TabScriptService from "../domain/TabScriptService";
import { sendMessageToTab } from "./ChromePromise";

export default class ChromeTabScriptService implements TabScriptService {


    reload(tabId : number, state: StateForTabScript): Promise<void> {
        const MESSAGE_KIND = "reload";
        return sendMessageToTab(state, MESSAGE_KIND, tabId);
    }

    startExploration(tabId : number, state: StateForTabScript): Promise<void> {
        const MESSAGE_KIND = "explorationStarted";
        return sendMessageToTab(state, MESSAGE_KIND, tabId);
    }

    stopExploration(tabId : number, state: StateForTabScript): Promise<void> {
        const MESSAGE_KIND = "explorationStopped";
        return sendMessageToTab(state, MESSAGE_KIND, tabId);
    }

    toggleUserView(tabId : number, visible: boolean): Promise<void> {
        const MESSAGE_KIND = "toggleUserView";
        return sendMessageToTab({visible}, MESSAGE_KIND, tabId);
    }
}