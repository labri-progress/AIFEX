import Session from "../domain/Session";

export default interface SessionRepository {
    findSessionById(sessionId: string): Promise<Session | undefined>;
}
