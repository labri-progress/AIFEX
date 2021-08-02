import Model from "./Model";
import { ModelPredictionType } from "./ModelPredictionType";

export default interface ModelService {

    findModelById(id: string): Promise<Model | undefined>;

    createModel(depth: number, interpolationfactor: number, predictionType : ModelPredictionType): Promise<string>;

    linkModelToSession(modelId: string, sessionId: string): Promise<"LinkIsDone" | "ModelIsUnknown">;

}