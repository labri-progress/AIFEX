import State from "./State";

export default interface BrowserService {
    getExtensionVesion():string;

    takeScreenshot(): Promise<string> ;

    getStateFromStorage(): Promise<State | undefined>;

    setStateToStorage(state: State): Promise<void>;

}