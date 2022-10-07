import Action from "./Action";
import Observation from "./Observation";
import { RecordingMode } from "./RecordingMode";
import Screenshot from "./Screenshot";
import Session from "./Session";
import { SessionOverlayType } from "./SessionOverlayType";
import Video from "./Video";

export default interface SessionService {

    ping(): Promise<boolean>;

    findSessionById(id: string): Promise<Session | undefined>;

    createSession(webSiteId: string, baseURL: string, name: string, description: string, overlayType: SessionOverlayType, recordingMode: RecordingMode): Promise<string>;

    updateSession(sessionId: string, webSiteId: string, baseURL: string, name: string, description: string, overlayType: SessionOverlayType, recordingMode: RecordingMode): Promise<Session>;

    addExploration(sessionId: string, testerName: string, interactionList: (Action | Observation)[], startDate?: Date, stopDate?: Date): Promise<number>;

    removeExploration(sessionId: string, explorationId: number): Promise<"ExplorationRemoved" | "ExplorationNotFound">;

    addScreenshots(screenshots: Screenshot[]): Promise<"ScreenshotsAdded">;

    findScreenshotsBySessionId(sessionId: string): Promise<Screenshot[]>;

    addVideo(video: Video): Promise<"VideoAdded">;

    findExplorationsWithVideo(sessionId: string): Promise<number[]>;

    addInteractions(sessionId: string, explorationNumber: number, interactionList: (Action | Observation)[]): Promise<"InteractionsAdded" | "ExplorationNotFound">;

}