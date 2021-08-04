import fetch from "node-fetch";
import Interaction from "../domain/Interaction";
import Model from "../domain/Model";
import { ModelPredictionType } from "../domain/ModelPredictionType";
import ModelService from "../domain/ModelService";
import config from "./config";


const MODEL_URL: string = `http://${config.model.host}:${config.model.port}/model/`;

export default class ModelServiceHTTP implements ModelService {

    findModelById(modelId: string): Promise<Model | undefined> {
        const ModelFindURL = MODEL_URL + modelId;
        return fetch(ModelFindURL)
            .then(response => {
                if (response.ok) {
                    return response.json()
                        .then((modelJSON) => {
                            return new Model(modelJSON.id, modelJSON.depth, modelJSON.interpolationfactor, modelJSON.predictionType, modelJSON.sessionIdList);
                        });                    
                } else {
                    return undefined;
                }
            })
    }

    linkModelToSession(modelId: string, sessionId: string): Promise<"ModelLinkedToSession" | "ModelIsUnknown"> {
        const ModelLinkURL = MODEL_URL + modelId + '/link/' + sessionId;
        return fetch(ModelLinkURL, { method: 'POST' })
            .then(response => {
                if (response.ok) {
                    return "ModelLinkedToSession"
                } else {
                    return "ModelIsUnknown"
                }
            })
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

    computeProbabilities(modelId: string, interactionList: Interaction[]): Promise<Map<string, number>> {
        const ModelComputeURL = MODEL_URL + modelId + '/getprobabilitymap';
        let optionModelCompute = {
            method: 'POST',
            body:    JSON.stringify(interactionList),
            headers: { 'Content-Type': 'application/json' },
        }
        return fetch(ModelComputeURL, optionModelCompute)
            .then(response => {
                if (response.ok) {
                    return response.json()
                        .then(json => {
                            let probMap : Map<string,number> = new Map();
                            json.forEach((proba: [string, number])  => {
                                probMap.set(proba[0], proba[1]);
                            });
                            return probMap;
                        });
                } else {
                    return new Map();
                }
            })
    }
}
