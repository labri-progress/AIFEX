
export default interface BrowserService {
    getExtensionVesion():string;

    takeScreenshot(): Promise<string> ;

    getFromStorage(key: string): Promise<any>;

    setToStorage(key: string, value: any): Promise<void>;

    openLongLiveTab(): Promise<any>;
}