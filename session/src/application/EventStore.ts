import Exploration from "../domain/Exploration";

export default interface IEventStore {
    notifySessionExploration(sessionId: string, exploration: Exploration): void;
}
