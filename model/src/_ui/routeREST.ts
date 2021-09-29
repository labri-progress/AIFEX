import ModelService from "../application/ModelService";
import Ngram from "../domain/Ngram";
import Note from "../domain/Note";
import NoteDistribution from "../domain/NoteDistribution";
import Sequence from "../domain/Sequence";
import Stimulus from "../domain/Stimulus";
import {Express} from "express";
import {logger} from "../logger";

const NOT_FOUND_STATUS = 404;
const INVALID_PARAMETERS_STATUS = 400;
const INTERNAL_SERVER_ERROR_STATUS = 500;

export default function attachRoutes(app: Express , modelService: ModelService): void {

    app.get("/model/ping", (req, res) => {
        logger.info(`ping`);
        res.send('alive');
    });

    app.get("/model/:modelId", (req, res) => {
        const {modelId} = req.params;
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
                res.json({
                    id: model.id,
                    depth: model.depth
                });
            } else {
                logger.debug(`no model id for modelId ${modelId}`);
                res.status(NOT_FOUND_STATUS).send({message: 'no model for Id'});
            }
        })
        .catch((e) => {
            logger.error(`modelId error ${e}`);
            res.status(INTERNAL_SERVER_ERROR_STATUS).send({message: e.message});
        });
    });

    app.post("/model/create", (req, res) => {
        const {depth, interpolationfactor, predictionType} = req.body;
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
            res.status(INTERNAL_SERVER_ERROR_STATUS).send({message: e.message});
        });
    });

    app.post("/model/:modelId/link/:sessionId", (req, res) => {
        const {modelId, sessionId} = req.params;
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
        .then( (model) => {
            if (model) {
                logger.debug(`model (modelId:${modelId}) linked to session (sessionId:${sessionId})`);
                res.json(model.id);
            } else {
                logger.debug(`modelId (${modelId}) is undefined`);
                res.status(NOT_FOUND_STATUS).send({message: 'model is undefined'});
            }
        })
        .catch((e) => {
            logger.error(`cannot link, error ${e}`);
            res.status(INTERNAL_SERVER_ERROR_STATUS).send({message: e.message});
        });
    });

    app.post("/model/:modelId/getprobabilitymap", (req, res) => {
        const {interactionList} = req.body;
        const {modelId} = req.params;
        logger.info(`getprobabilitymap for modelId:${modelId} with interactionList : ${interactionList}`);

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
            } else if (interaction.concreteType === "Comment") {
                seq.addNote(new Note(value));
            }
        });
        modelService.getStimulusProbabilityMap(modelId, seq)
        .then((probabilityMap) => {
            logger.debug(`return probability`);
            return res.json(Array.from(probabilityMap));
        })
        .catch( (e) => {
            logger.error(`getprobabilitymap error ${e}`);
            res.status(INTERNAL_SERVER_ERROR_STATUS).send({message: e.message});
        });
    });

    app.post("/model/:modelId/getcommentdistributions", (req, res) => {
        const {interactionList} = req.body;
        const {modelId} = req.params;
        logger.info(`getcommentlist for modelId:${modelId}, ${interactionList}`);

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
            const data : any[] = [];
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
            logger.debug(`commentlist is returned`);
            return res.json(data);
        })
        .catch( (e) => {
            logger.error(`getcommentlist error ${e}`);
            res.status(INTERNAL_SERVER_ERROR_STATUS).send("error");
        });
    });

    app.get("/model/:modelId/analyze/allngram", (req, res) => {
        const {modelId} = req.params;
        logger.info(`analyze allngram for modelId:${modelId}`);

        if (modelId === undefined) {
            logger.warn(`modelId must not be undefined`);
            res.status(INVALID_PARAMETERS_STATUS).send("modelId is undefined");
            return;
        }

        modelService.getAllNgram(modelId)
        .then( (result) => {
            logger.debug(`allngram for modelId:${modelId} are returned`);
            res.json(ngramToJSON(result));
        })
        .catch((e) => {
            logger.error(`allngram error ${e}`);
            res.status(INTERNAL_SERVER_ERROR_STATUS).send(e);
        });
    });

    app.post("/model/cross_entropy_evolution", (req, res) => {
        const {sessionId_list, depth, interpolationfactor} = req.body;
        logger.info(`cross_entropy_evolution`);
        if (sessionId_list === undefined) {
            logger.warn(`cross_entropy_evolution no sessionId_list`);
            return res.status(INVALID_PARAMETERS_STATUS).send("sessionId_list parameter is required");
         } else if (!Array.isArray(sessionId_list)) {
            logger.warn(`cross_entropy_evolution no sessionId_list`);
            return res.status(INVALID_PARAMETERS_STATUS).send("sessionId_list must be an array of session id");
         } else {
             modelService.getCrossEntropyEvolutionForSessions(sessionId_list, depth, interpolationfactor)
             .then((crossEntropies) => {
                logger.debug(`cross_entropy_evolution ok`);
                res.send(crossEntropies);
             }).catch((e) => {
                logger.error(`cross_entropy_evolution error ${e}`);
                res.status(INTERNAL_SERVER_ERROR_STATUS).send(e);
             });
         }
    });

    app.get("/model/profile_coverage/:modelId1/:modelId2", (req, res) => {
        const {modelId1, modelId2} = req.params;
        if (modelId1 === undefined) {
            logger.warn(`profile_coverage/modelId1/modelId2 no modelId1`);
            return res.status(INVALID_PARAMETERS_STATUS).send("modelId1 parameter is required");
        }
        if (modelId2 === undefined) {
            logger.warn(`profile_coverage/modelId1/modelId2 no modelId2`);
            return res.status(INVALID_PARAMETERS_STATUS).send("modelId2 parameter is required");
        }
        modelService.getProfileCoverage(modelId1, modelId2)
            .then((coverage) => res.send({coverage}))
            .catch((e) => {
                logger.error(`profile_coverage/modelId1/modelId2 error ${e}`);
                res.status(INVALID_PARAMETERS_STATUS).send(e);
            });
    });

}

function ngramToJSON(ngramSet: Ngram[]): any[] {
    const jsonData : any[] = [];
    ngramSet.forEach( (ngram) => {
        const ngramData : {
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
            ngramData.successorStimulusSet.push({key, occurence});
        }
        for (const [key, occurence] of ngram.successorNote.entries()) {
            ngramData.successorNoteSet.push({key, occurence});
        }
        jsonData.push(ngramData);
    });
    return jsonData;
}
