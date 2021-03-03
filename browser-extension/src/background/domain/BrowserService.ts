export default interface BrowserService {
    aifexPopupActivatedUrl: string;

    getExtensionVesion():string;

    createWindow(url?:string):Promise<number>;

    createTab(windowId: number, url: string): Promise<number | undefined>;

    focusTab(tabId: number): Promise<void>;

    getCurrentWindow() : Promise<{windowId:number, tabsId?:number[]}>;

    getTabIdListOfWindow(windowId: number): Promise<number[]>;

    drawAttentionToWindow(windowId: number):Promise<void>;

    closeWindow(windowId: number):Promise<void>;

    closeTab(tabId: number): Promise<void>;

    runScript(tabId: number): Promise<boolean>;

    restartWindow(windowId : number, url?:string):Promise<void>;

    takeScreenshot(windowId : number): Promise<string> ;

    captureStreamOnWindow(): Promise<{stream:MediaStream, id: number}> ;

    hideCapture(id: number) : void ;

    setPopupToDetached(): void;

    setPopupToAttached(): void;

    attachBrowserActionClicked( handler : (tabId:number ) => void): void;

    attachWindowCreatedHandler( handler : (windowId:number) => void): void;

    attachWindowRemovedHandler( handler : (windowId:number) => void): void;

    attachTabCreatedHandler( handler : (tabId:number, windowId:number) => void): void;

    attachTabRemovedHandler( handler : (tabId:number, windowId:number) => void): void;

    attachTabDetachedHandler( handler : (tabId:number, windowId:number) => void): void;

    attachTabAttachedHandler( handler : (tabId:number, windowId:number) => void): void;

    attachTabActivatedHandler( handler : (tabId:number, windowId:number) => void): void;

    attachOnDomLoadedHandler( handler : (tabId:number) => void): void;

    attachOnCommittedHandler( handler : (tabId:number) => void): void;

}