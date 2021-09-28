import Session from "../domain/Session";
import Interaction from "./Interaction";
import Tester from "./Tester";
export default interface ISessionRepository {

    addSession(session: Session): Promise<string>;

    addExploration(sessionId: string, explorationNumber: number, tester: Tester, startDate: Date, submissionAttempt: number): Promise<number>;

    updateInteractionListOfExploration(sessionId: string, explorationNumber: number, updatedInteractionList: Interaction[]): Promise<void>;

    updateExplorationIsStopped(sessionId: string, explorationNumber: number, stopDate: Date): Promise<void>;

    findSessionById(sessionId: string): Promise<Session | undefined>;

    setSubmissionAttempt(sessionId: string, explorationNumber: number, submissionAttempt: number): Promise<void>;

}
