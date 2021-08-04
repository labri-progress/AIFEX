import Interaction from "./Interaction";
import Model from "./Model";
import { ModelPredictionType } from "./ModelPredictionType";

export default interface ModelService {

    findModelById(id: string): Promise<Model | undefined>;

    createModel(depth: number, interpolationfactor: number, predictionType : ModelPredictionType): Promise<string>;

    linkModelToSession(modelId: string, sessionId: string): Promise<"ModelLinkedToSession" | "ModelIsUnknown">;

    computeProbabilities(modelId: string, interactionList: Interaction[]): Promise<Map<string,number>>;

}