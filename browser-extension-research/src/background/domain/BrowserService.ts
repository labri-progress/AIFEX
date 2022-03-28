import Window from "./Window";

export default interface BrowserService {
    aifexPopupAttachedUrl: string;

    getExtensionVesion():string;

    createWindow(isPrivateNavigation: boolean,url?: string): Promise<Window>;

    createTab(windowId: number, url: string): Promise<number | undefined>;

    focusTab(tabId: number): Promise<void>;

    getCurrentWindow() : Promise<Window>;

    getTabIdListOfWindow(windowId: number): Promise<number[]>;

    drawAttentionToWindow(windowId: number):Promise<void>;

    closeWindow(windowId: number):Promise<void>;

    closeTab(tabId: number): Promise<void>;

    runScript(tabId: number): Promise<boolean>;

    restartWindow(windowId : number, url?:string):Promise<void>;

    takeScreenshot(windowId : number): Promise<string> ;

    captureStreamOnWindow(): Promise<{stream:MediaStream, id: number} | "Canceled" > ;

    hideCapture(id: number) : void ;

    setPopupToDetached(): void;

    setPopupToAttached(): void;

    attachBrowserActionClicked( handler : (tabId:number ) => void): void;
    
    attachWindowCreatedHandler(handler: (window: Window) => void): void;

    attachWindowRemovedHandler( handler : (windowId:number) => void): void;

    attachTabCreatedHandler( handler : (tabId:number, windowId:number) => void): void;

    attachTabRemovedHandler( handler : (tabId:number, windowId:number) => void): void;

    attachTabDetachedHandler( handler : (tabId:number, windowId:number) => void): void;

    attachTabAttachedHandler( handler : (tabId:number, windowId:number) => void): void;

    attachTabActivatedHandler( handler : (tabId:number, windowId:number) => void): void;

    attachOnDomLoadedHandler( handler : (tabId:number) => void): void;

    attachOnCommittedHandler( handler : (tabId:number) => void): void;

}