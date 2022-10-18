import SessionRepository from "../domain/SessionRepository";

export default class GeneratorService {
    public sessionRepository: SessionRepository;

    constructor(sessionRepository : SessionRepository) {
        this.sessionRepository = sessionRepository;
    }

    public createTestsThatCoverAllActions(sessionId: string): Promise<string | undefined> {
        return this.sessionRepository.findSessionById(sessionId)
            .then((session) => {
                if (session === undefined) {
                    return Promise.resolve(undefined);
                }
                return Promise.resolve("Test created");
            });
    }
    
}
