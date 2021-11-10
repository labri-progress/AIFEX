import BrowserService from "./BrowserService";
import Tab from "./Tab";
import Window from "./Window";

export default class AifexPopup {

    private _browserService: BrowserService;
    private _aifexWindow: Window | undefined;
    private _aifexTab: Tab | undefined;

    get isDetached():boolean {
        return this._aifexTab !== undefined;
    }

    constructor(browserService: BrowserService) {
        this._browserService = browserService;
        this._aifexWindow = undefined;
        this._aifexTab = undefined;
    }

    get aifexPageUrl(): string {
        return this._browserService.aifexPopupAttachedUrl;
    }

    public toggleDetached(): Promise<void> {
        if (this.isDetached) {
            return this.attachAsPopup();
        } else {
            return this.detachInNewWindow()
        }
    }

    public displayPopupAttached(): void {
        this._browserService.setPopupToAttached();
    }

    public displayPopupDetached(): void {
        this._browserService.setPopupToDetached();
    }

    public attachBrowserHandlers(): void {
        this._browserService.attachTabRemovedHandler(this.tabRemoveHandler.bind(this));
        this._browserService.attachWindowRemovedHandler(this.WindowRemovedHandler.bind(this));
        this._browserService.attachTabAttachedHandler(this.tabAttachedHandler.bind(this));
    }

    public attachAsPopup(): Promise<void> {
        if (this._aifexTab) {
            return this._browserService.closeTab(this._aifexTab.id)
        } else {
            return Promise.resolve();
        }
    }

    public onBrowserActionClicked(): void {
        this.attachAsPopup()
        .then(() => this._browserService.setPopupToAttached())
    }

    public detachInNewWindow(): Promise<void> {
        let createWindowPromise;
        if (!this._aifexWindow) {
            createWindowPromise = this._browserService.createWindow(this.aifexPageUrl)
            .then((windowId : number | undefined) => {
                if (windowId === undefined) {
                    throw new Error("Window id is undefined");
                }
                this._aifexWindow = new Window(windowId);
                return this._browserService.getTabIdListOfWindow(windowId)
            })
            .then((tabIdList) => {
                if (tabIdList.length === 0) {
                    return;
                } else {
                    this._aifexTab = new Tab(tabIdList[0]);
                }
            })
            .then(() => this.displayPopupDetached())
        } else {
            createWindowPromise = Promise.resolve();
        }
        return createWindowPromise.then(() => {
            if (!this._aifexTab) {
                if (this._aifexWindow) {
                    return this._browserService.createTab(this._aifexWindow.id, this.aifexPageUrl)
                    .then((tabId) => {
                        if (tabId !== undefined && Number.isInteger(tabId)) {
                            this._aifexTab = new Tab(tabId);
                        } 
                    })
                }                
            }
        })
        .then(() => {
            if (this._aifexTab) {
                return this._browserService.focusTab(this._aifexTab.id)
            }
        })
    }

    private tabRemoveHandler(tabId: number, windowId: number): void {
        if (tabId === this._aifexTab?.id) {
            this._aifexTab = undefined;
            this._aifexWindow = undefined;
            this.displayPopupAttached()
        }
    }

    private tabAttachedHandler(tabId: number, windowId: number): void {
        if (tabId === this._aifexTab?.id) {
            this._aifexWindow = new Window(windowId);
        }
    }

    private WindowRemovedHandler(windowId: number): void {
        if (windowId === this._aifexWindow?.id) {
            this._aifexWindow = undefined;
            this._aifexTab = undefined;
            this.displayPopupAttached()
        }
    }
}
