import State from "./State";

export default interface BrowserService {
    getStateFromStorage(): Promise<State>;

    addListenerToChangeInState(listener : (oldState: State | undefined, newState: State | undefined) => void): void;

}