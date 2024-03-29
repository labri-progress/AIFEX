import ModelService from "../application/ModelService";
import Ngram from "../domain/Ngram";
import Note from "../domain/Note";
import NoteDistribution from "../domain/NoteDistribution";
import Sequence from "../domain/Sequence";
import Stimulus from "../domain/Stimulus";
import Model from "../domain/Model";
import FISModel from "../domain/FISModel";
import SPModel from "../domain/SPModel";
import CSPModel from "../domain/CSPModel";
import { Express } from "express";
import { logger } from "../logger";

const NOT_FOUND_STATUS = 404;
const INVALID_PARAMETERS_STATUS = 400;
const INTERNAL_SERVER_ERROR_STATUS = 500;

export default function attachRoutes(app: Express, modelService: ModelService): void {

    app.get("/model/ping", (req, res) => {
        logger.info(`ping`);
        res.send('alive');
    });

    app.get("/model/:modelId", (req, res) => {
        const { modelId } = req.params;
        logger.info(`get modelId ${modelId}`);

        if (modelId === undefined) {
            logger.warn(`modelId must not be undefined`);
            res.status(INVALID_PARAMETERS_STATUS).send("modelId is undefined");
            return;
        }
        modelService.mountModel(modelId)
            .then((model) => {
                if (model) {
                    logger.debug(`modelId ${modelId} is returned`);
                    res.json(modelToJSON(model));
                } else {
                    logger.debug(`no model id for modelId ${modelId}`);
                    res.status(NOT_FOUND_STATUS).send({ message: 'no model for Id' });
                }
            })
            .catch((e) => {
                logger.error(`modelId error ${e}`);
                res.status(INTERNAL_SERVER_ERROR_STATUS).send({ message: e.message });
            });
    });

    app.post("/model/create", (req, res) => {
        const { depth, interpolationfactor, predictionType } = req.body;
        logger.info(`create depth ${depth}, interpolationfactor ${interpolationfactor}, predictionType ${predictionType}`);

        if (depth === undefined) {
            logger.warn(`depth must not be undefined`);
            res.status(INVALID_PARAMETERS_STATUS).send("depth is undefined");
            return;
        }

        let modelCreationPromise;
        switch (predictionType) {
            case "CSP":
                modelCreationPromise = modelService.createModelCSPModel(depth, interpolationfactor);
                break;
            case "SP":
                modelCreationPromise = modelService.createSPModel(depth);
                break;
            case "FIS":
                modelCreationPromise = modelService.createFISModel(depth);
                break;
            default:
                modelCreationPromise = modelService.createModelCSPModel(depth, interpolationfactor);
                break;
        }
        modelCreationPromise
            .then((model) => {
                logger.debug(`create model ok`);
                res.json(model);
            })
            .catch((e) => {
                logger.error(`create model error ${e}`);
                res.status(INTERNAL_SERVER_ERROR_STATUS).send({ message: e.message });
            });
    });

    app.post("/model/:modelId/link/:sessionId", (req, res) => {
        const { modelId, sessionId } = req.params;
        logger.info(`link model (modelId:${modelId}) to session (sessionId:${sessionId})`);

        if (modelId === undefined) {
            logger.warn(`modelId must not be undefined`);
            res.status(INVALID_PARAMETERS_STATUS).send("modelId is undefined");
            return;
        }
        if (sessionId === undefined) {
            logger.warn(`sessionId must not be undefined`);
            res.status(INVALID_PARAMETERS_STATUS).send("sessionId is undefined");
            return;
        }

        modelService.linkModelWithSessionIdAndSynchronize(modelId, sessionId)
            .then((model) => {
                if (model) {
                    logger.debug(`model (modelId:${modelId}) linked to session (sessionId:${sessionId})`);
                    res.json(model.id);
                } else {
                    logger.debug(`modelId (${modelId}) is undefined`);
                    res.status(NOT_FOUND_STATUS).send({ message: 'model is undefined' });
                }
            })
            .catch((e) => {
                logger.error(`cannot link, error ${e}`);
                res.status(INTERNAL_SERVER_ERROR_STATUS).send({ message: e.message });
            });
    });

    app.post("/model/:modelId/getprobabilitymap", (req, res) => {
        const { interactionList } = req.body;
        const { modelId } = req.params;
        logger.info(`getprobabilitymap for modelId:${modelId} with interactionList : ${JSON.stringify(interactionList)}`);

        if (modelId === undefined) {
            logger.warn(`modelId must not be undefined`);
            res.status(INVALID_PARAMETERS_STATUS).send("modelId is undefined");
            return;
        }
        if ((interactionList === undefined) || !Array.isArray(interactionList)) {
            logger.warn(`interactionList must not be undefined`);
            res.status(INVALID_PARAMETERS_STATUS).send("interactionList is undefined");
            return;
        }

        const seq = new Sequence();
        interactionList.forEach((interaction) => {
            let value = interaction.kind;
            if (interaction.value !== undefined) {
                value = value + "$" + interaction.value;
            }
            if (interaction.concreteType === "Action") {
                seq.addStimulus(new Stimulus(value));
            } else if (interaction.concreteType === "Observation") {
                seq.addNote(new Note(value));
            }
        });
        modelService.getStimulusProbabilityMap(modelId, seq)
            .then((probabilityMap) => {
                let resultAsArray = Array.from(probabilityMap);
                logger.debug(`return probability:`+JSON.stringify(resultAsArray));
                return res.json(resultAsArray);
            })
            .catch((e) => {
                logger.error(`getprobabilitymap error ${e}`);
                res.status(INTERNAL_SERVER_ERROR_STATUS).send({ message: e.message });
            });
    });

    app.get("/model/:modelId/getstimulusoccurencemap", (req, res) => {
        const { modelId } = req.params;
        logger.info(`getstimulusoccurencemap for modelId:${modelId}`);

        if (modelId === undefined) {
            logger.warn(`modelId must not be undefined`);
            res.status(INVALID_PARAMETERS_STATUS).send("modelId is undefined");
            return;
        }
        modelService.getStimulusOccurenceMap(modelId)
            .then((occurenceMap) => {
                let resultAsArray = Array.from(occurenceMap);
                logger.debug(`return occurenceMap:`+JSON.stringify(resultAsArray));
                return res.json(resultAsArray);
            })
            .catch((e) => {
                logger.error(`getstimulusoccurencemap error ${e}`);
                res.status(INTERNAL_SERVER_ERROR_STATUS).send({ message: e.message });
            });
    });

    app.post("/model/:modelId/getobservationdistributions", (req, res) => {
        const { interactionList } = req.body;
        const { modelId } = req.params;
        logger.info(`getobservationdistributions for modelId:${modelId}, ${interactionList}`);

        if (modelId === undefined) {
            logger.warn(`modelId must not be undefined`);
            res.status(INVALID_PARAMETERS_STATUS).send("modelId is undefined");
            return;
        }
        if ((interactionList === undefined) || !Array.isArray(interactionList)) {
            logger.warn(`interactionList must not be undefined`);
            res.status(INVALID_PARAMETERS_STATUS).send("interactionList is undefined");
            return;
        }

        const sequence = new Sequence();
        interactionList.forEach((interaction) => {
            let value = interaction.kind;
            if (interaction.value !== undefined) {
                value = value + "$" + interaction.value;
            }
            if (interaction.concreteType === "Action") {
                sequence.addStimulus(new Stimulus(value));
            }
        });
        modelService.getNoteDistributionListMap(modelId, sequence)
            .then((noteDistributionListMap) => {
                const data: any[] = [];
                noteDistributionListMap.forEach((distributionList, note) => {
                    data.push({
                        note,
                        distributions: distributionList.map((distribution: NoteDistribution) => ({
                            contextOccurence: distribution.contextOccurence,
                            noteOccurence: distribution.noteOccurence,
                            context: distribution.context.map((stimulus: Stimulus) => stimulus.value),
                        })),
                    });
                });
                logger.debug(`observationlist is returned`);
                return res.json(data);
            })
            .catch((e) => {
                logger.error(`getobservationlist error ${e}`);
                res.status(INTERNAL_SERVER_ERROR_STATUS).send("error");
            });
    });

    app.get("/model/:modelId/analyze/allngram", (req, res) => {
        const { modelId } = req.params;
        logger.info(`analyze allngram for modelId:${modelId}`);

        if (modelId === undefined) {
            logger.warn(`modelId must not be undefined`);
            res.status(INVALID_PARAMETERS_STATUS).send("modelId is undefined");
            return;
        }

        modelService.getAllNgram(modelId)
            .then((result) => {
                logger.debug(`allngram for modelId:${modelId} are returned`);
                res.json(ngramToJSON(result));
            })
            .catch((e) => {
                logger.error(`allngram error ${e}`);
                res.status(INTERNAL_SERVER_ERROR_STATUS).send(e);
            });
    });

    app.post("/model/cross_entropy/session/:sessionId", (req, res) => {
        const { sessionId } = req.params;

        const { depth, interpolationfactor, predictionType } = req.body;
        logger.info(`cross_entropy_evolution`);
        if (sessionId === undefined) {
            logger.warn(`cross_entropy_evolution no sessionId`);
            return res.status(INVALID_PARAMETERS_STATUS).send("sessionId_list parameter is required");
        } else {
            modelService.getCrossEntropyEvolutionForSession(sessionId, depth, interpolationfactor, predictionType)
                .then((crossEntropy) => {
                    logger.debug(`cross_entropy_evolution computed`);
                    res.send(crossEntropy);
                }).catch((e) => {
                    logger.error(`cross_entropy_evolution error ${e}`);
                    res.status(INTERNAL_SERVER_ERROR_STATUS).send(e);
                });
        }
    });

    app.get("/model/profile_coverage/:modelId1/:modelId2", (req, res) => {
        const { modelId1, modelId2 } = req.params;
        if (modelId1 === undefined) {
            logger.warn(`profile_coverage/modelId1/modelId2 no modelId1`);
            return res.status(INVALID_PARAMETERS_STATUS).send("modelId1 parameter is required");
        }
        if (modelId2 === undefined) {
            logger.warn(`profile_coverage/modelId1/modelId2 no modelId2`);
            return res.status(INVALID_PARAMETERS_STATUS).send("modelId2 parameter is required");
        }
        modelService.getProfileCoverage(modelId1, modelId2)
            .then((coverage) => res.send({ coverage }))
            .catch((e) => {
                logger.error(`profile_coverage/modelId1/modelId2 error ${e}`);
                res.status(INVALID_PARAMETERS_STATUS).send(e);
            });
    });

}

function ngramToJSON(ngramSet: Ngram[]): any[] {
    const jsonData: any[] = [];
    ngramSet.forEach((ngram) => {
        const ngramData: {
            key: string,
            n: number,
            occurence: number,
            successorStimulusSet: any[],
            successorNoteSet: any[],
        } = {
            key: ngram.key,
            n: ngram.n,
            occurence: ngram.occurence,
            successorStimulusSet: [],
            successorNoteSet: [],
        };
        for (const [key, occurence] of ngram.successorStimulus.entries()) {
            ngramData.successorStimulusSet.push({ key, occurence });
        }
        for (const [key, occurence] of ngram.successorNote.entries()) {
            ngramData.successorNoteSet.push({ key, occurence });
        }
        jsonData.push(ngramData);
    });
    return jsonData;
}


function modelToJSON(model: Model): any {
    let json: any = {};
    json.id = model.id;
    json.depth = model.depth;
    json.sessionIdList = model.getLinkedSessionIdList();
    if (model instanceof FISModel) {
        json.predictionType = "FIS";
        json.interpolationfactor = 0;
    } else if (model instanceof SPModel) {
        json.predictionType = "SP";
        json.interpolationfactor = 0;
    } else if (model instanceof CSPModel) {
        json.predictionType = "CSP";
        json.interpolationfactor = model.interpolationfactor;
    }
    return json;
}

