import fetch from "node-fetch";
import Model from "../domain/Model";
import { ModelPredictionType } from "../domain/ModelPredictionType";
import ModelService from "../domain/ModelService";
import config from "./config";


const MODEL_URL: string = `http://${config.model.host}:${config.model.port}/model/`;

export default class ModelServiceHTTP implements ModelService {
    findModelById(id: string): Promise<Model | undefined> {
        throw new Error("Method not implemented.");
    }

    linkModelToSession(modelId: string, sessionId: string): Promise<"LinkIsDone" | "ModelIsUnknown"> {
        throw new Error("Method not implemented.");
    }

    
    createModel(depth: number, interpolationfactor: number, predictionType : ModelPredictionType): Promise<string> {
        let model = {
            depth,
            interpolationfactor,
            predictionType
        }
        const ModelCreationURL = MODEL_URL + 'create';
        let optionModelCreate = {
            method: 'POST',
            body:    JSON.stringify(model),
            headers: { 'Content-Type': 'application/json' },
        }
        return fetch(ModelCreationURL, optionModelCreate)
            .then(response => {
                if (response.ok) {
                    return response.json()
                } else {
                    throw new Error("Error"+response.statusText);
                }
            })
    }
}
