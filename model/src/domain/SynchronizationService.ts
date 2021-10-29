import SessionRepository from "./SessionRepository";
import Model from "./Model";
export default class SynchronizationService {

    public sessionRepository: SessionRepository;

    constructor(sessionRepository : SessionRepository) {
        this.sessionRepository = sessionRepository;
    }

    public synchronizeModelWithSession(model: Model, sessionId: string): Promise<Model> {
        if (!model.getLinkedSessionIdList().includes(sessionId)) {
            return Promise.reject("cannot synchronize, sessionId not in the list");
        } else {
            return this.sessionRepository.fetchSequenceListOfSession(sessionId).then((sequenceDataList) => {
                const sequenceList = sequenceDataList.map((sequenceData) => sequenceData.sequence);
                sequenceList.forEach((sequence) => {
                    model.learnSequence(sequence);
                });
                return model;
            });
        }
    }

    public synchronizeModel(model: Model): Promise<Model> {
        if (!model) {
            throw new Error("Model is not defined");
        }
        const promiseAll = model.getLinkedSessionIdList().map((sessionId) => {
            return this.synchronizeModelWithSession(model, sessionId);
        });
        return Promise.all(promiseAll)
            .then(() => {
                return model;
            });
    }
}
