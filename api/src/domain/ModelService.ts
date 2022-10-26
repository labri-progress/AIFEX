import Action from "./Action";
import Observation from "./Observation";
import Model from "./Model";
import { ModelPredictionType } from "./ModelPredictionType";
import ObservationDistribution from "./ObservationDistribution";
import Ngram from "./Ngram";

export default interface ModelService {
    computeCrossEntropy(sessionId: string, depth: number, predictionType: string, interpolationfactor: number): Promise<{explorationNumber: number, crossEntropy: number}[]>;

    ping(): Promise<boolean>;

    findModelById(id: string): Promise<Model | undefined>;

    createModel(depth: number, interpolationfactor: number, predictionType : ModelPredictionType): Promise<string>;

    linkModelToSession(modelId: string, sessionId: string): Promise<"ModelLinkedToSession" | "ModelIsUnknown">;

    computeProbabilities(modelId: string, interactionList: (Action | Observation)[]): Promise<Map<string,number>>;

    getObservationDistributions(modelId: string, interactionList: (Action | Observation)[]): Promise<Map<string,ObservationDistribution[]>>;

    getAllNgram(modelId: string): Promise<Ngram[]>;

    computeActionOccurences(modelId: string): Promise<Map<string, number>>;

}