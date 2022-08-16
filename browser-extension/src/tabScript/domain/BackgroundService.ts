import Action from "./Action";

export default interface BackgroundService {
    sendAction(action: Action): Promise<void>;
}