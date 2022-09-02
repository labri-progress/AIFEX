import State from "./State";

export default interface BrowserService {
    getStateFromStorage(): Promise<State>;

    addListenerToChangeInState(listener : (oldState: State, newState: State) => void): void;

}