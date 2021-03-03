import Sequence from "./Sequence";

export default interface SessionRepository {
    fetchSequenceListOfSession(sessionId: string): Promise<Array<{sequence: Sequence, sessionId: string, explorationKey: string}>>;
}
