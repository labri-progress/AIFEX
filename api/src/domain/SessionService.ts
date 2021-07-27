import Session, { SessionOverlayType } from "./Session";
import Token from "./Token";

export default interface SessionService {

    findSessionIds(token: Token): Promise<string[] | "Unauthorized">;

    findSessionById(token: Token, id: string): Promise<Session | "Unauthorized">;

    createSession(token: Token, webSiteId : string, baseURL : string, name : string, overlayType: SessionOverlayType ): Promise<string> ;

    addExploration(token: Token, sessionId: string, testerName: string, interactionList : Array<{index: number, concreteType: string, kind: string, value: string, date?: Date}>, startDate: Date, stopDate: Date) : Promise<number | "Unauthorized">;

}