import Session from "../src/domain/Session";
import SessionRepository from "../src/domain/SessionRepository";

export default class InSessionRepository implements SessionRepository {

    private sessionMap: Map<string, Session>;

    constructor() {
        this.sessionMap = new Map();
    }

    public findSessionById(sessionId: string): Promise<Session> {
        return Promise.resolve(this.sessionMap.get(sessionId));
    }

    public addSession(session: Session): void {
        this.sessionMap.set(session.id, session);
    }

}
