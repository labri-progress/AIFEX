import { logger } from "../Logger";
import BrowserService from "./BrowserService";
import Window from "./Window";


export default class WindowManager {
    private _browserService : BrowserService;
    private _connectedWindow : Window | undefined;
    private _lastCreatedWindow : Window | undefined;
    private _onWindowRemovedListener: ((windowId : number) => void)[];

    constructor(browserService : BrowserService) {
        this._browserService = browserService;
        this._connectedWindow = undefined;
        this._lastCreatedWindow = undefined;
        this._onWindowRemovedListener = [];
    }

    addOnWindowRemovedListener(listener : (windowId : number) => void): void {
        this._onWindowRemovedListener.push(listener);
    }

    createConnectedWindow(url?:string) : Promise<void> {
        return this._browserService.createWindow(url)
        .then((id) => {
            if (id === undefined) {
                throw new Error("Window id is undefined");
            }
            if (this._lastCreatedWindow?.id !== id) {
                let connectedWindow = new Window(id);
                this._connectedWindow = connectedWindow;
                this._browserService.getTabIdListOfWindow(this._connectedWindow.id)
                .then((tabIdList) => {
                    if (tabIdList) {
                        tabIdList.forEach(tabId => connectedWindow.addTab(tabId));
                    }
                })
                .catch((e) => {
                    console.error(e)
                })
            } else {
                this._connectedWindow = this._lastCreatedWindow;
            }
        })
    }

    connectToExistingWindow() : Promise<void> {
        return this._browserService.getCurrentWindow()
            .then(({windowId,tabsId}) => {
                if (this._connectedWindow && this._connectedWindow.id === windowId) {
                    return;
                }
                let connectedWindow = new Window(windowId);
                this._connectedWindow = connectedWindow ;
                if (tabsId) {
                    tabsId.forEach(tabId => {
                        connectedWindow.addTab(tabId);
                        this.connectTab(tabId);
                    });
                }
            })
            .catch(() => {
                console.error("Failed to getCurrentCurrent");
            })
    }

    removeConnectedWindow() : Promise<void> {
        const connectedWindowId = this.getConnectedWindowId();
        if (connectedWindowId) {
            return this._browserService.closeWindow(connectedWindowId)
                .then((_) => {
                    this._connectedWindow = undefined;
                })
                .catch(error => {
                    console.error("Failed to remove connected window : ", error.message);
                })
        } else {
            return Promise.resolve();
        }
    }

    reloadConnectedWindow(url?:string) : Promise<void> {
        if (this._connectedWindow) {
            return this._browserService.restartWindow(this._connectedWindow.id, url)
            .catch(error => {
                console.error("Failed to reload connected window : ", error.message);
            })
        } else {
            return Promise.resolve();
        }
        
    }

    getConnectedWindowId() : number | undefined {
        return this._connectedWindow?.id;
    }

    getConnectedTabIds() : number[] {
        if (this._connectedWindow) {
            return this._connectedWindow.getConnectedTabIds();
        } else {
            return [];
        }
    }

    getActivatedTabId() : number | undefined {
        return this._connectedWindow?.getActivatedTabId();
    }

    connectTab(tabId : number): void {
        if (this._connectedWindow) {
            let connectedWindow = this._connectedWindow;
            if (this._connectedWindow.hasTab(tabId)) {
                this._browserService.runScript(tabId)
                    .then((isRunning) => {
                        if (isRunning) {
                            connectedWindow.connectTab(tabId);
                        }
                    })
            }
        }
    }

    public attachHandlers() : void{
        this._browserService.attachWindowCreatedHandler(this.onWindowCreated.bind(this));
        this._browserService.attachWindowRemovedHandler(this.onWindowRemoved.bind(this));
        this._browserService.attachTabCreatedHandler(this.onTabCreated.bind(this));
        this._browserService.attachTabRemovedHandler(this.onTabRemoved.bind(this));
        this._browserService.attachTabDetachedHandler(this.onTabDetached.bind(this));
        this._browserService.attachTabAttachedHandler(this.onTabAttached.bind(this));
        this._browserService.attachTabActivatedHandler(this.onTabActivated.bind(this));
        this._browserService.attachOnDomLoadedHandler(this.onNavigationDOMLoaded.bind(this));
    }



    private onWindowCreated(createdWindowId: number | undefined) : void{
        if (this._connectedWindow === undefined && createdWindowId!== undefined) {
            this._lastCreatedWindow = new Window(createdWindowId);
            const window = this._lastCreatedWindow;
            const id = this._lastCreatedWindow.id;
            this._browserService.getCurrentWindow()
            .then(({windowId, tabsId}) => {
                if (windowId === id) {
                    if (tabsId) {
                        tabsId.forEach(tabId => window.addTab(tabId));
                    }
                }
            })
            .catch((e) => {
                console.error(e)
            })
        }
    }

    private onWindowRemoved(windowId: number) : void{
        if (windowId === undefined) {
            return;
        }
        if (windowId === this._connectedWindow?.id) {
            this._onWindowRemovedListener.forEach(listener => listener(windowId));
            this._connectedWindow = undefined;
        } else {
            if (windowId === this._lastCreatedWindow?.id) {
                this._lastCreatedWindow = undefined;
            }
        }
    }

    private onTabCreated(tabId: number, windowId: number) : void{
        logger.debug(`tab ${tabId} created to window ${windowId}`);
        if (windowId === this._connectedWindow?.id) {
            logger.debug(`tab ${tabId} added to window ${windowId}`);
            this._connectedWindow.addTab(tabId);
        } else {
            if (windowId === this._lastCreatedWindow?.id) {
                logger.debug(`tab ${tabId} added to window ${windowId}`);
                this._lastCreatedWindow.addTab(tabId);
            }
        }
    }

    private onTabRemoved(tabId: number, windowId:number) : void {

        if (windowId === this._connectedWindow?.id) {
            this._connectedWindow.removeTab(tabId);
        } else {
            if (windowId === this._lastCreatedWindow?.id) {
                this._lastCreatedWindow.removeTab(tabId);
            }
        }
    }

    private onTabDetached(tabId: number, windowId:number) : void {
        if (windowId === this._connectedWindow?.id) {
            this._connectedWindow.removeTab(tabId);
        } else {
            if (windowId === this._lastCreatedWindow?.id) {
                this._lastCreatedWindow.removeTab(tabId);
            }
        }
    }

    private onTabAttached(tabId: number, windowId:number) : void {
        if (windowId === this._connectedWindow?.id) {
            this._connectedWindow.addTab(tabId);
        } else {
            if (windowId === this._lastCreatedWindow?.id) {
                this._lastCreatedWindow.addTab(tabId);
            }
        }
    }

    private onTabActivated(tabId: number, windowId: number) : void {
        if (windowId === this._connectedWindow?.id) {
            this._connectedWindow.activateTab(tabId);
        } else {
            if (windowId === this._lastCreatedWindow?.id) {
                this._lastCreatedWindow.activateTab(tabId);
            }
        }
    }

    private onNavigationDOMLoaded(tabId: number) : void {
        this.connectTab(tabId);
    }

}