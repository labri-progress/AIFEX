import Exploration from "../domain/Exploration";
import Interaction from "../domain/Interaction";

export default interface IEventStore {
    notifySessionExploration(sessionId: string, exploration: Exploration, interactionList: Interaction[] | undefined): void;
}
