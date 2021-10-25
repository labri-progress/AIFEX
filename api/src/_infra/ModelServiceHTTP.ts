import CommentDistribution from "../domain/CommentDistribution";
import Interaction from "../domain/Action";
import Model from "../domain/Model";
import { ModelPredictionType } from "../domain/ModelPredictionType";
import ModelService from "../domain/ModelService";
import Ngram from "../domain/Ngram";
import config from "./config";
import fetch from "node-fetch";


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
            body:    JSON.stringify({interactionList}),
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

    getCommentDistributions(modelId: string, interactionList: Interaction[]): Promise<Map<string,CommentDistribution[]>> {
        const ModelComputeURL = MODEL_URL + modelId + '/getcommentdistributions';
        let optionModelCompute = {
            method: 'POST',
            body:    JSON.stringify({interactionList}),
            headers: { 'Content-Type': 'application/json' },
        }
        return fetch(ModelComputeURL, optionModelCompute)
            .then(response => {
                if (response.ok) {
                    return response.json()
                        .then(dataArray => {
                            let commentDistributions : Map<string,CommentDistribution[]> = new Map();
                            dataArray.forEach((data: { note: string; distributions: any[]; })  => {
                                commentDistributions.set(data.note, data.distributions.map((d) => new CommentDistribution(d.context, d.noteOccurence, d.contextOccurence)));
                            });
                            return commentDistributions;
                        });
                } else {
                    return new Map();
                }
            })
    }

    getAllNgram(modelId: string): Promise<Ngram[]> {
        const ModelComputeURL = MODEL_URL + modelId + '/analyze/allngram';
        return fetch(ModelComputeURL)
            .then(response => {
                if (response.ok) {
                    return response.json()
                        .then(dataArray => {
                            let ngrams : Ngram[] = [];
                            dataArray.forEach((data: {
                                key: string,
                                n: number,
                                occurence: number,
                                successorStimulusSet: any[],
                                successorNoteSet: any[],
                            })  => {
                                ngrams.push(new Ngram(data.key, data.n, data.occurence, data.successorStimulusSet, data.successorNoteSet));
                            });
                            return ngrams;
                        });
                } else {
                    return [];
                }
            })
    }
}
