
import BrowserService from "../domain/BrowserService";
import { getWindowById, updateWindowById, createWindow, getCurrentWindow, removeWindowById, executeTabScript, removeTabs, createTab, takeScreenshot, captureStreamOnWindow, focusTab } from "./FirefoxPromise";
import WindowOption from "./WindowOption";
import {logger} from "../Logger";
import Window from "../domain/Window";

const DEFAULT_WINDOW_OPTIONS = {url:'https://www.aifex.fr'};
const DEFAULT_TAB_OPTIONS = {};

export default class FirefoxBrowserService implements BrowserService {

    recorder : MediaRecorder | undefined;
    stream : MediaStream | undefined;
    recordedChunks : Blob[];
    lastInterval : NodeJS.Timer | undefined;

    constructor() {
        this.recorder = undefined;
        this.stream = undefined;
        this.recordedChunks = [];
    }


    get aifexPopupAttachedUrl(): string {
        return browser.runtime.getURL("/aifex_page/index.html");
    }

    get aifexPopupDetachedPage(): string {
        return chrome.runtime.getURL("/aifex_page/detached.html");
    }

    getExtensionVesion(): string {
        return browser.runtime.getManifest().version
    }

    createWindow(isPrivateNavigation: boolean, url?:string): Promise<Window> {
        const options = Object.assign(DEFAULT_WINDOW_OPTIONS, 
        {
            url,
            icognito: isPrivateNavigation
        });
        const windowOption = new WindowOption(options);
        let createdWindow: Window;
        return createWindow(windowOption)
            .then( (window: browser.windows.Window) => {
                if (window && window.id) {
                    return new Window(window.id, window.incognito);
                } else {
                    return Promise.reject(`cannot create window`);
                }
            })
            .then((newWindow: Window) => {
                createdWindow = newWindow;
                return this.getTabIdListOfWindow(createdWindow.id)  
            })
            .then((tabIdList) => {
                if (tabIdList) {
                    tabIdList.forEach(tabId => createdWindow.addTab(tabId));
                }
                return createdWindow;
            })
    }

    createTab(windowId: number, url?: string): Promise<number | undefined> {
        const options =  Object.assign(DEFAULT_TAB_OPTIONS, {windowId, url});
        return createTab(options)
        .then((tab: browser.tabs.Tab) => {
            return tab.id;
        });
    }

    getTabIdListOfWindow(windowId: number): Promise<number[]> {
        return browser.windows.get(windowId, {populate: true})
        .then((window) => {
            if (window && window.tabs) {
                return window.tabs.map(tab => tab.id).filter((id : number | undefined): id is number => id !== undefined);
            } else {
                console.error("Cannot find window")
                return [];
            }
        })
    }

    getCurrentWindow(): Promise<Window> {
        return getCurrentWindow()
        .then( (window:browser.windows.Window) => {
            if (window && window.id) {
                let windowId : number = window.id;
                let tabsId : number[] | undefined;
                if (window.tabs) {
                    tabsId =  window.tabs?.map(tab => tab.id).filter((id : number | undefined): id is number => id !== undefined);
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

    focusTab(tabId: number): Promise<void> {
        return focusTab(tabId);
    }

    drawAttentionToWindow(windowId: number): Promise<void> {
        return getWindowById(windowId)
            .then( _window => {
                return updateWindowById(windowId, {drawAttention: true,focused: true});
            })
    }
    
    closeWindow(windowId: number):Promise<void> {
        return removeWindowById(windowId);
    }

    closeTab(tabId: number): Promise<void> {
        throw removeTabs([tabId]);
    }

    runScript(tabId: number): Promise<boolean> {
        return executeTabScript(tabId)
    }

    restartWindow(windowId: number, url?: string): Promise<void> {
        let tabIds : number[];
        return getWindowById(windowId)
            .then((window) => {
                return window.tabs
            })
            .then((tabs) => {
                if (tabs) {
                    tabIds = tabs.map(tab=>tab.id).filter( (id : number | undefined) : id is number => id !== undefined);
                    return createTab({windowId, index:0, url});
                }
            })
            .then(() => {
                return removeTabs(tabIds);
            })
    }


    takeScreenshot(windowId : number): Promise<string> {
        return takeScreenshot(windowId);
    }


    captureStreamOnWindow(): Promise<{stream:MediaStream, id: number} | "Canceled"> {
        return captureStreamOnWindow();
    }

    hideCapture(id: number) : void {
        logger.warn("Not implemented hide capture")
    }

    setPopupToDetached(): void {
        browser.browserAction.setPopup({popup: this.aifexPopupDetachedPage})
    }

    setPopupToAttached(): void {
        browser.browserAction.setPopup({popup: this.aifexPopupAttachedUrl})
    }

    attachBrowserActionClicked( handler : (windowId:number) => void): void {
        browser.browserAction.onClicked.addListener((tab) => {
            if (tab.id) {
                handler(tab.id);
            }
        });
    }

    attachWindowCreatedHandler( handler : (window:Window) => void) : void{
        browser.windows.onCreated.addListener((window: browser.windows.Window) => {
            if (window.id) {
                handler(new Window(window.id, window.incognito));
            }
        })
    }

    attachWindowRemovedHandler(handler: (windowId: number) => void) : void{
        browser.windows.onRemoved.addListener(handler);
    }

    attachTabCreatedHandler(handler : (tabId:number, windowId:number) => void) : void{
        browser.tabs.onCreated.addListener((tab) => {
            if (tab.id && tab.windowId) {
                handler(tab.id, tab.windowId);
            }
        })
    }

    attachTabRemovedHandler(handler : (tabId:number, windowId:number) => void) : void{
        browser.tabs.onRemoved.addListener( (tabId, removeInfo) => {
            handler(tabId, removeInfo.windowId);
        });
    }

    attachTabDetachedHandler(handler: (tabId: number, windowId: number) => void) : void{
        browser.tabs.onDetached.addListener( (tabId , detachInfo) => {
            handler(tabId, detachInfo.oldWindowId);
        })
    }

    attachTabAttachedHandler(handler: (tabId: number, windowId: number) => void) : void{
        browser.tabs.onAttached.addListener((tabId, attachInfo) => {
            handler(tabId, attachInfo.newWindowId);
        })
    }

    attachTabActivatedHandler(handler: (tabId: number, windowId: number) => void) : void{
        browser.tabs.onActivated.addListener((activeInfo) => {
            handler(activeInfo.tabId, activeInfo.windowId);
        })
    }

    attachOnDomLoadedHandler( handler : (tabId:number) => void) : void {
        browser.webNavigation.onDOMContentLoaded.addListener(details => {
            const NAVIGATION_OCCURS_IN_TOP_FRAME = 0;
            if (details.frameId === NAVIGATION_OCCURS_IN_TOP_FRAME) {
                handler(details.tabId);
            }
        })
    }

    attachOnCommittedHandler( handler : (tabId:number) => void) : void{
        browser.webNavigation.onDOMContentLoaded.addListener(details => {
            const NAVIGATION_OCCURS_IN_TOP_FRAME = 0;
            if (details.frameId === NAVIGATION_OCCURS_IN_TOP_FRAME) {
                handler(details.tabId);
            }
        })
    }

}
