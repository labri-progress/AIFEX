import State from "./State";

export default interface BrowserService {
    getExtensionVesion():string;

    takeScreenshot(): Promise<string> ;

    getStateFromStorage(): Promise<State>;

    setStateToStorage(state: State): Promise<void>;

    onExtensionDisconnect(listener : () => void) : void;

}