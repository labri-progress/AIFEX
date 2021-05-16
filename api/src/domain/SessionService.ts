import Session, { SessionOverlayType } from "./Session";
import Token from "./Token";

export default interface SessionService {

    getSessionIds(token: Token): Promise<string[] | "Unauthorized">;

    getSessionById(token: Token, id: string): Promise<Session | "Unauthorized">;

    //createSession(token: Token, session: Session): Promise<string> | "Unauthorized";

}