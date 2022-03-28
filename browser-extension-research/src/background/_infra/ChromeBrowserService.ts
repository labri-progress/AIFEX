
import BrowserService from "../domain/BrowserService";
import { captureStreamOnWindow, getWindowById, updateWindowById, createWindow, getCurrentWindow, removeWindowById, executeTabScript, removeTabs, createTab, takeScreenshot, getTabIdListOfWindow, getTabById, focusTab } from "./ChromePromise";
import WindowOption from "./WindowOption";
import { logger } from "../Logger";
import Window from "../domain/Window";
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

    get aifexPopupAttachedUrl(): string {
        return chrome.runtime.getURL("/aifex_page/index.html");
    }

    get aifexPopupDetachedUrl(): string {
        return chrome.runtime.getURL("/aifex_page/detached.html");
    }

    getExtensionVesion(): string {
        return chrome.runtime.getManifest().version
    }

    createWindow(isPrivateNavigation: boolean, url?: string): Promise<Window> {
        const options = Object.assign(DEFAULT_WINDOW_OPTIONS, { 
            url,
            incognito: isPrivateNavigation
        });
        const chromeOptions = new WindowOption(options);
        let createdWindow: Window;
        return createWindow(chromeOptions)
            .then((window: chrome.windows.Window) => {
                if (!window.id) {
                    throw new Error("Window is created without an id");
                } else {
                    return new Window(window.id, window.incognito);
                }
            })
            .then((newWindow: Window) => {
                createdWindow = newWindow;
                return getTabIdListOfWindow(createdWindow.id)  
            })
            .then((tabIdList) => {
                if (tabIdList) {
                    tabIdList.forEach(tabId => createdWindow.addTab(tabId));
                }
                return createdWindow;
            })
    }

    createTab(windowId: number, url: string): Promise<number | undefined> {
        const options = Object.assign(DEFAULT_TAB_OPTIONS, { windowId, url });
        return createTab(options)
            .then((tab: chrome.tabs.Tab) => {
                return tab.id;
            });
    }


    getCurrentWindow(): Promise<Window> {
        return getCurrentWindow()
            .then((window: chrome.windows.Window) => {
                if (window && window.id) {
                    let windowId: number = window.id;
                    let tabsId: number[] | undefined;
                    if (window.tabs) {
                        tabsId = window.tabs.map(tab => tab.id).filter((id: number | undefined): id is number => id !== undefined);
                    }
                    let currentWindow = new Window(windowId, window.incognito);
                    tabsId?.forEach(tabId => {
                        currentWindow.addTab(tabId);
                    })
                    return currentWindow
                } else {
                    return Promise.reject(`no current window`);
                }
            })
    }

    getTabIdListOfWindow(windowId: number): Promise<number[]> {
        return getTabIdListOfWindow(windowId)
    }

    drawAttentionToWindow(windowId: number): Promise<void> {
        console.log("drawAttentionToWindow")
        return getWindowById(windowId)
            .then(_window => {
                console.log("window", _window)
                return updateWindowById(windowId, { drawAttention: true, focused: true });
            })

    }


    focusTab(tabId: number): Promise<void> {
        return focusTab(tabId);
    }

    closeWindow(windowId: number): Promise<void> {
        logger.debug('managedWindow will be closed');
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

    captureStreamOnWindow(): Promise<{ stream: MediaStream, id: number } | "Canceled" > {
        return captureStreamOnWindow();
    }

    hideCapture(id: number): void {
        chrome.desktopCapture.cancelChooseDesktopMedia(id);
    }

    setPopupToDetached(): void {
        chrome.action.setPopup({ popup: this.aifexPopupDetachedUrl });
    }

    setPopupToAttached(): void {
        chrome.action.setPopup({ popup: this.aifexPopupAttachedUrl });
    }

    attachBrowserActionClicked(handler: (windowId: number) => void): void {
        chrome.action.onClicked.addListener((tab) => {
            if (tab.id) {
                handler(tab.id);
            }
        });
    }

    attachWindowCreatedHandler(handler: (window: Window) => void): void {
        console.log('chrome.windows', chrome.windows);
        console.log('chrome.windows.onCreated', chrome.windows.onCreated);
        chrome.windows.onCreated.addListener((window) => {
            if (window.id) {
                handler(new Window(window.id, window.incognito));
            } else {
                logger.debug("Skipped created window without id")
            }
        })
    }

    attachWindowRemovedHandler(handler: (windowId: number) => void): void {
        chrome.windows.onRemoved.addListener(handler);
    }

    attachTabCreatedHandler(handler: (tabId: number, windowId: number) => void): void {
        console.log('chrome.tabs', chrome.tabs);
        console.log('chrome.tabs.onCreated', chrome.tabs.onCreated);
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
