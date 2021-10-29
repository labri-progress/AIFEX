import Model from "./Model";

export default interface ModelRepository {
    addModel(model: Model): Promise<string>;

    findModelById(modelId: string): Promise<Model | undefined>;

    addSessionToModel(modelId: string, sessionId: string): Promise<void>;
}
