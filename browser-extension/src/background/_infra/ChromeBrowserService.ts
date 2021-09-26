
import BrowserService from "../domain/BrowserService";
import { captureStreamOnWindow, getWindowById, updateWindowById, createWindow, getCurrentWindow, removeWindowById, executeTabScript, removeTabs, createTab, takeScreenshot, getTabIdListOfWindow, getTabById, focusTab } from "./ChromePromise";
import WindowOption from "./WindowOption";
import { logger } from "../Logger";
const DEFAULT_WINDOW_OPTIONS = { url: 'https://www.aifex.fr' };
const DEFAULT_TAB_OPTIONS = {};

export default class ChromeBrowserService implements BrowserService {

    recorder: MediaRecorder | undefined;
    stream: MediaStream | undefined;
    recordedChunks: Blob[];
    lastInterval : NodeJS.Timer | undefined;

    constructor() {
        this.recorder = undefined;
        this.stream = undefined;
        this.recordedChunks = [];
    }

    get aifexPopupActivatedUrl(): string {
        return chrome.runtime.getURL("/aifex_page/index.html");
    }

    get aifexPopupDeactivatedUrl(): string {
        return chrome.runtime.getURL("/aifex_page/deactivated.html");
    }

    getExtensionVesion(): string {
        return chrome.runtime.getManifest().version
    }

    createWindow(url?: string): Promise<number> {
        const options = Object.assign(DEFAULT_WINDOW_OPTIONS, { url });
        const chromeOptions = new WindowOption(options);
        return createWindow(chromeOptions)
            .then(window => {
                return window.id;
            })
    }

    createTab(windowId: number, url: string): Promise<number | undefined> {
        const options = Object.assign(DEFAULT_TAB_OPTIONS, { windowId, url });
        return createTab(options)
            .then((tab: chrome.tabs.Tab) => {
                return tab.id;
            });
    }


    getCurrentWindow(): Promise<{ windowId: number, tabsId?: number[] }> {
        return getCurrentWindow()
            .then((window) => {
                if (window && window.id) {
                    let windowId: number = window.id;
                    let tabsId: number[] | undefined;
                    if (window.tabs) {
                        tabsId = window.tabs.map(tab => tab.id).filter((id: number | undefined): id is number => id !== undefined);
                    }
                    return {
                        windowId,
                        tabsId
                    }
                } else {
                    return Promise.reject(`no current window`);
                }
            })
    }

    getTabIdListOfWindow(windowId: number): Promise<number[]> {
        return getTabIdListOfWindow(windowId)
    }

    drawAttentionToWindow(windowId: number): Promise<void> {
        return getWindowById(windowId)
            .then(_window => {
                return updateWindowById(windowId, { drawAttention: true, focused: true });
            })
    }

    setExtensionIconToDefault(): void {
        if (this.lastInterval) {
            clearInterval(this.lastInterval);
        }
        try {
            chrome.browserAction.setIcon({ path: "/images/aifex_icon.png" });
        } catch (_) { }
    }

    setExtensionIconToRecording(): void {
        if (this.lastInterval) {
            clearInterval(this.lastInterval);
        }
        let flipFlop = false;
        this.lastInterval = setInterval(() => {
            try {
                if (flipFlop) {
                    chrome.browserAction.setIcon({ path: "/images/aifex_icon.png" });
                    flipFlop = false;
                } else {
                    chrome.browserAction.setIcon({ path: "/images/aifex_icon_rec.png" });
                    flipFlop = true;
                }
            } catch (_) { }
        }, 1000)
    }

    setExtensionIconToReceivedNotification(): void {
        if (this.lastInterval) {
            clearInterval(this.lastInterval);
        }
        let flipFlop = false;
        this.lastInterval = setInterval(() => {
            try {
                if (flipFlop) {
                    chrome.browserAction.setIcon({ path: "/images/aifex_icon_notif.png" });
                    flipFlop = false;
                } else {
                    chrome.browserAction.setIcon({ path: "/images/aifex_icon_rec_notif.png" });
                    flipFlop = true;
                }
            } catch (_) { }
        }, 1000)
    }


    focusTab(tabId: number): Promise<void> {
        return focusTab(tabId);
    }

    closeWindow(windowId: number): Promise<void> {
        logger.debug('managaedWindow will be closed');
        return removeWindowById(windowId);
    }

    closeTab(tabId: number): Promise<void> {
        return removeTabs([tabId]);
    }

    runScript(tabId: number): Promise<boolean> {
        return executeTabScript(tabId)
    }

    restartWindow(windowId: number, url: string): Promise<void> {
        let tabIds: number[];
        return getWindowById(windowId)
            .then((window) => {
                return window.tabs
            })
            .then((tabs) => {
                if (tabs) {
                    tabIds = tabs.map(tab => tab.id).filter((id): id is number => id !== undefined);
                    return createTab({ windowId, index: 0, url });
                }
            })
            .then(() => {
                return removeTabs(tabIds);
            })
    }


    takeScreenshot(windowsId: number): Promise<string> {
        return takeScreenshot(windowsId);
    }

    captureStreamOnWindow(): Promise<{ stream: MediaStream, id: number }> {
        return captureStreamOnWindow();
    }

    hideCapture(id: number): void {
        chrome.desktopCapture.cancelChooseDesktopMedia(id);
    }

    setPopupToDetached(): void {
        chrome.browserAction.setPopup({ popup: this.aifexPopupDeactivatedUrl });
    }

    setPopupToAttached(): void {
        chrome.browserAction.setPopup({ popup: this.aifexPopupActivatedUrl });
    }

    attachBrowserActionClicked(handler: (windowId: number) => void): void {
        chrome.browserAction.onClicked.addListener((tab) => {
            if (tab.id) {
                handler(tab.id);
            }
        });
    }

    attachWindowCreatedHandler(handler: (windowId: number) => void): void {
        chrome.windows.onCreated.addListener((window) => {
            handler(window.id);
        })
    }

    attachWindowRemovedHandler(handler: (windowId: number) => void): void {
        chrome.windows.onRemoved.addListener(handler);
    }

    attachTabCreatedHandler(handler: (tabId: number, windowId: number) => void): void {
        chrome.tabs.onCreated.addListener((tab) => {
            if (tab.id) {
                handler(tab.id, tab.windowId);
            }
        })
    }

    attachTabRemovedHandler(handler: (tabId: number, windowId: number) => void): void {
        chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
            handler(tabId, removeInfo.windowId);
        });
    }

    attachTabDetachedHandler(handler: (tabId: number, windowId: number) => void): void {
        chrome.tabs.onDetached.addListener((tabId, detachInfo) => {
            handler(tabId, detachInfo.oldWindowId);
        })
    }

    attachTabAttachedHandler(handler: (tabId: number, windowId: number) => void): void {
        chrome.tabs.onAttached.addListener((tabId, attachInfo) => {
            handler(tabId, attachInfo.newWindowId);
        })
    }

    attachTabActivatedHandler(handler: (tabId: number, windowId: number) => void): void {
        chrome.tabs.onActivated.addListener((activeInfo) => {
            handler(activeInfo.tabId, activeInfo.windowId);
        })
    }

    attachOnDomLoadedHandler(handler: (tabId: number) => void): void {
        chrome.webNavigation.onDOMContentLoaded.addListener(details => {
            const NAVIGATION_OCCURS_IN_TOP_FRAME = 0;
            if (details.frameId === NAVIGATION_OCCURS_IN_TOP_FRAME) {
                handler(details.tabId);
            }
        })
    }

    attachOnCommittedHandler(handler: (tabId: number) => void): void {
        chrome.webNavigation.onDOMContentLoaded.addListener(details => {
            const NAVIGATION_OCCURS_IN_TOP_FRAME = 0;
            if (details.frameId === NAVIGATION_OCCURS_IN_TOP_FRAME) {
                handler(details.tabId);
            }
        })
    }

}
