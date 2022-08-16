import State from "./State";

export default interface BrowserService {
    getStateFromStorage(): Promise<State>;

}