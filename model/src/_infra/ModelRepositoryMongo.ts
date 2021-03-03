import CSPModel from "../domain/CSPModel";
import ModelRepository from "../domain/ModelRepository";
import ModelSchema, { ModelDocument } from "./ModelSchema";

export default class ModelRepositoryMongo implements ModelRepository {

    public addModel(model: CSPModel): Promise<string> {
        return ModelSchema.create({
                _id: model.id,
                depth: model.depth,
                interpolationfactor: model.interpolationfactor,
                sessionIdList: model.getLinkedSessionIdList(),
            })
            .then( () => {
                return model.id;
            });
    }

    public findModelById(modelId: string): Promise<CSPModel | undefined> {
        return ModelSchema.findOne({_id: modelId}).lean().exec()
            .then((modelData) => {
                if (!modelData) {
                    return undefined;
                }
                const model = new CSPModel(modelData.depth, modelData.interpolationfactor, modelId);
                if (modelData.sessionIdList) {
                    modelData.sessionIdList.forEach((sessionId) => {
                        model.linkWithSession(sessionId);
                    });
                }
                return model;
            });
    }

    public addSessionToModel(modelId: string, sessionId: string): Promise<void>  {
        return ModelSchema.findOne({_id: modelId})
        .then((model) => {
            if (model) {
                if (model.sessionIdList) {
                    model.sessionIdList.push(sessionId);
                }
                return model.save();
            }
        })
        .then(() => {
            return;
        });
    }
}
