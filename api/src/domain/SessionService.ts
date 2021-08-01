import Screenshot from "./Screenshot";
import Session, { SessionOverlayType } from "./Session";

export default interface SessionService {

    findSessionById(id: string): Promise<Session | undefined>;

    createSession(webSiteId : string, baseURL : string, name : string, overlayType: SessionOverlayType ): Promise<string> ;

    addExploration(sessionId: string, testerName: string, interactionList : Array<{index: number, concreteType: string, kind: string, value: string, date?: Date}>, startDate: Date, stopDate: Date) : Promise<number>;

    addScreenshots(screenshots: Screenshot[]) : Promise<"ScreenshotsAdded">

}