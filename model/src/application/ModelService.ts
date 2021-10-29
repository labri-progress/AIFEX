import ModelRepository from "../domain/ModelRepository";
import Ngram from "../domain/Ngram";
import NoteDistribution from "../domain/NoteDistribution";
import Sequence from "../domain/Sequence";
import SessionRepository from "../domain/SessionRepository";
import SynchronizationService from "../domain/SynchronizationService";
import FISModel from "../domain/FISModel";
import CSPModel from "../domain/CSPModel";
import Model from "../domain/Model";
import SPModel from "../domain/SPModel";

const CACHE_SIZE = 5;

export default class ModelService {
    public modelRepository: ModelRepository;
    public sessionRepository: SessionRepository;
    public synchronizationService: SynchronizationService;
    public mountedModelList: Model[];
    public crossEntropyObservers: any[];

    constructor(modelRepository : ModelRepository, sessionRepository : SessionRepository) {
        this.modelRepository = modelRepository;
        this.sessionRepository = sessionRepository;
        this.synchronizationService = new SynchronizationService(this.sessionRepository);
        this.mountedModelList = [];
        this.crossEntropyObservers = [];
    }

    public createModelCSPModel(depth: number, interpolationfactor: number): Promise<string> {
        const model = new CSPModel(depth, interpolationfactor);
        this.addModelInCache(model);
        return this.modelRepository.addModel(model)
        .then((modelId) => {
            return modelId;
        })
    }

    public createFISModel(depth: number): Promise<string> {
        const model = new FISModel(depth);
        this.addModelInCache(model);
        return this.modelRepository.addModel(model)
        .then((modelId) => {
            return modelId;
        })
    }

    public createSPModel(depth: number): Promise<string> {
        const model = new SPModel(depth);
        this.addModelInCache(model);
        return this.modelRepository.addModel(model)
        .then((modelId) => {
            return modelId;
        })
    }

    public linkModelWithSessionIdAndSynchronize(modelId: string, sessionId: string): Promise<Model | undefined> {
        let model: Model;
        return this.mountModel(modelId)
        .then ((modelMounted) => {
            if (modelMounted) {
                model = modelMounted;
                model.linkWithSession(sessionId);
                return this.modelRepository.addSessionToModel(model.id, sessionId)
                .then(() => {
                    return this.synchronizationService.synchronizeModelWithSession(model, sessionId);
                })
            }
        })
    }

    public mountModel(modelId: string): Promise<Model | undefined> {
        const modelInCache = this.mountedModelList.find(model => model.id === modelId);
        if (modelInCache) {
            return Promise.resolve(modelInCache);
        }

        return this.modelRepository.findModelById(modelId)
            .then(modelFound => {
                if (modelFound) {
                    this.addModelInCache(modelFound);
                    return this.synchronizationService.synchronizeModel(modelFound)
                } 
            })
    }

    public addModelInCache(model: Model): Model {
        if (this.mountedModelList.length >= CACHE_SIZE) {
            this.mountedModelList.shift();
        }
        this.mountedModelList[this.mountedModelList.length] = model;
        return model;
    }

    public learn(modelId: string, sequence: Sequence): Promise<void> {
        return this.mountModel(modelId)
            .then((model) => {
                if (model) {
                    model.learnSequence(sequence);
                }
            });
    }

    public hasNewSequence(sessionId: string, sequence: Sequence): void {
        const modelInCache = this.mountedModelList.find( (model) => {
            return model.getLinkedSessionIdList().includes(sessionId);
        });
        if (modelInCache) {
            const crossEntropy = modelInCache.crossEntropy(sequence.getContext());
            this.notifyCrossEntropy(crossEntropy, modelInCache.id);
            modelInCache.learnSequence(sequence);
        }
    }

    public getStimulusProbabilityMap(modelId: string, sequence: Sequence): Promise<Map<string, number>> {
        return this.mountModel(modelId)
            .then((model) => {
                if (model) {
                    return model.getStimulusProbabilityMap(sequence);
                } else {
                    return new Map();
                }
            });
    }

    public getNoteDistributionListMap(modelId: string, sequence: Sequence): Promise<Map<string, NoteDistribution[]>> {
        return this.mountModel(modelId)
            .then((model) => {
                if (model) {
                    return model.getNoteDistributionListMap(sequence);
                } else {
                    return new Map();
                }
            });
    }

    public getAllNgram(modelId: string): Promise<Ngram[]>  {
        return this.mountModel(modelId)
            .then( (model) => {
                if (model) {
                    const ngramSet = model.getAllNgram();
                    return ngramSet;
                } else {
                    return [];
                }
            });
    }

    public getProfileCoverage(modelId1: string, modelId2: string): Promise<number[]> {
        let model1 : Model;
        
        return this.mountModel(modelId1)
            .then((mountedModel1) => {
                if (mountedModel1) {
                    return this.mountModel(modelId2)
                    .then((model2) => {
                        if (model2) {
                            return model1.profileBasedCoverage(model2);
                        } else {
                            return [];
                        }
                    })
                } else {
                    return [];
                }
            })
    }

    public getCrossEntropyEvolutionForSessions(sessionIdList: string[], depth : number, interpolationfactor : number): Promise<{sessionId : string, crossEntropy: number, explorationKey : string}[]> {
        const sessionsDataPromises = sessionIdList.map((sessionId) => {
            return this.sessionRepository.fetchSequenceListOfSession(sessionId);
        });
        const model = new CSPModel(depth, interpolationfactor);
        const result : {sessionId : string, crossEntropy: number, explorationKey : string}[] = [];
        return Promise.all(sessionsDataPromises)
            .then((sessionsData) => {
                sessionsData.forEach((sessionData) => {
                    sessionData.forEach((sequenceData) => {
                        const sequence = sequenceData.sequence;

                        const crossEntropy = model.crossEntropy(sequence.getContext());
                        result.push({
                            sessionId: sequenceData.sessionId,
                            explorationKey: sequenceData.explorationKey,
                            crossEntropy,
                        });
                        model.learnSequence(sequence);
                    });
                });
                return result;
            });
    }

    public addCrossEntropyObserver(observer : {notifyCrossEntropy : (corssEntropy : number, modelId : string) => void}): void {
        this.crossEntropyObservers.push(observer);
    }

    private notifyCrossEntropy(crossEntropy: number, modelId : string): void {
        this.crossEntropyObservers.forEach((observer) => {
            observer.notifyCrossEntropy(crossEntropy, modelId);
        });
    }

}
