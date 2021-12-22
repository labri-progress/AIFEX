import Session from "../domain/Session";
import Interaction from "./Interaction";
import { RecordingMode } from "./RecordingMode";
import { SessionOverlayType } from "./SessionOverlyaType";
import Tester from "./Tester";
export default interface SessionRepository {

    addSession(session: Session): Promise<string>;

    addExploration(sessionId: string, explorationNumber: number, tester: Tester, startDate: Date): Promise<number>;

    updateSession(sessionId: string, name: string, webSiteId: string, baseURL: string, description: string, overlayType: SessionOverlayType, recordingMode: RecordingMode): Promise<void>;

    changeDescription(sessionId: string, description: string): Promise<void>;

    changeName(sessionId: string, name: string): Promise<void>;

    updateInteractionListOfExploration(sessionId: string, explorationNumber: number, updatedInteractionList: Interaction[]): Promise<void>;

    updateExplorationIsStopped(sessionId: string, explorationNumber: number, stopDate: Date): Promise<void>;

    findSessionById(sessionId: string): Promise<Session | undefined>;

}
