import Action from "../domain/Action";
import SessionRepository from "../domain/SessionRepository";
import { computeMinimalExplorationsCoveringAllActions } from "../domain/TestService";

export default class GeneratorService {
    public sessionRepository: SessionRepository;

    constructor(sessionRepository : SessionRepository) {
        this.sessionRepository = sessionRepository;
    }

    public createTestsThatCoverAllActions(sessionId: string): Promise<Action[][] | undefined> {
        return this.sessionRepository.findSessionById(sessionId)
            .then((session) => {
                if (session === undefined) {
                    return Promise.resolve(undefined);
                }
                return computeMinimalExplorationsCoveringAllActions(session);
            });
    }
    
}
