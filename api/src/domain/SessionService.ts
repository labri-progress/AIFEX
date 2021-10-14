import Action from "./Action";
import Comment from "./Comment";
import Screenshot from "./Screenshot";
import Session, { SessionOverlayType } from "./Session";
import Video from "./Video";

export default interface SessionService {

    findSessionById(id: string): Promise<Session | undefined>;

    createSession(webSiteId: string, baseURL: string, name: string, description: string, overlayType: SessionOverlayType): Promise<string>;

    addExploration(sessionId: string, testerName: string, interactionList: (Action | Comment)[], startDate?: Date, stopDate?: Date): Promise<number>;

    addScreenshots(screenshots: Screenshot[]): Promise<"ScreenshotsAdded">;

    findScreenshotsBySessionId(sessionId: string): Promise<Screenshot[]>;

    addVideo(video: Video): Promise<"VideoAdded">;

    findVideosBySessionId(sessionId: string): Promise<Video[]>;

    addInteractions(sessionId: string, explorationNumber: number, interactionList: (Action | Comment)[]): Promise<"InteractionsAdded" | "ExplorationNotFound">;

}