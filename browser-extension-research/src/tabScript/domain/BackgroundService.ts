import State from "./State";
import Action from "./Action";

export default interface BackgroundService {
    getState(): Promise<State>;
    sendAction(action: Action): Promise<void>;
}