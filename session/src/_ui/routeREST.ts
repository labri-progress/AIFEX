import multer from "multer";
import SessionService from "../application/SessionService";
import ActionInteraction from "../domain/ActionInteraction";
import ObersationInteraction from "../domain/ObservationInteraction";
import { Express, Request } from "express";
import { logger } from "../logger";
import Session from "../domain/Session";

const SUCCESS_STATUS = 200;
const NOT_FOUND_STATUS = 404;
const INVALID_PARAMETERS_STATUS = 400;
const INTERNAL_SERVER_ERROR_STATUS = 500;

export default function attachRoutes(app: Express, sessionService: SessionService): void {

    app.get("/session/ping", (req, res) => {
        logger.info("ping");
        res.send("alive");
    });

    app.post("/session/create", (req, res) => {
        const { webSiteId, baseURL, name, description, overlayType, recordingMode } = req.body;
        logger.info(`create session webSiteId ${webSiteId}, baseURL ${baseURL}, name ${name}, description ${description}, overlayType ${overlayType}, recordingMode ${recordingMode}`);
        if (webSiteId === undefined) {
            logger.warn(`webSiteId must not be undefined`);
            res.status(INVALID_PARAMETERS_STATUS).send("webSiteId is undefined");
            return;
        }
        if (baseURL === undefined) {
            logger.warn(`baseURL must not be undefined`);
            res.status(INVALID_PARAMETERS_STATUS).send("baseURL is undefined");
            return;
        }

        if (name === undefined) {
            logger.warn(`name must not be undefined`);
            res.status(INVALID_PARAMETERS_STATUS).send("name is undefined");
            return;
        }

        if (description === undefined) {
            logger.warn(`description must not be undefined`);
            res.status(INVALID_PARAMETERS_STATUS).send("description is undefined");
            return;
        }

        if (recordingMode !== undefined && !Session.getRecordingModes().includes(recordingMode)) {
            logger.warn(`recordingMode must be byexploration or byinteraction`);
            res.status(INVALID_PARAMETERS_STATUS).send("recordingMode is undefined");
            return;
        }

        if (overlayType !== undefined && !Session.getOverlayTypes().includes(overlayType)) {
            logger.warn(`overlayType must be rainbow, bluesky, shadow`);
            res.status(INVALID_PARAMETERS_STATUS).send("Invalid overlayType");
            return;
        }


        sessionService.createNewSessionForWebSiteId(webSiteId, baseURL, name, description, overlayType, recordingMode)
            .then((sessionId) => {
                if (sessionId) {
                    logger.debug(`session created : ${sessionId}`);
                    res.json(sessionId);
                } else {
                    res.status(NOT_FOUND_STATUS).send('sessionId does not exist');
                }
            })
            .catch((e) => {
                logger.error(`session create error ${e}`);
                res.status(INTERNAL_SERVER_ERROR_STATUS).send(e);
            });
    });

    app.get("/session/:sessionId", (req, res) => {
        const { sessionId } = req.params;
        logger.info(`get session sessionId ${sessionId}`);
        if (sessionId === undefined) {
            logger.warn(`sessionId must not be undefined`);
            res.status(INVALID_PARAMETERS_STATUS).send("sessionId is undefined");
            return;
        }
        sessionService.mountSession(sessionId)
            .then((session) => {
                if (session) {
                    logger.info("session found and returned");
                    res.json({
                        id: session.id,
                        name: session.name,
                        baseURL: session.baseURL,
                        webSite: session.webSite,
                        createdAt: session.createdAt,
                        description: session.description,
                        overlayType: session.overlayType,
                        recordingMode: session.recordingMode,

                        explorationList: session.explorationList.map((exploration) => {
                            return {
                                testerName: exploration.tester.name,
                                startDate: exploration.startDate,
                                stopDate: exploration.stopDate,
                                explorationNumber: exploration.explorationNumber,
                                isStopped : exploration.isStopped === undefined ? false : exploration.isStopped,
                                isRemoved : exploration.isRemoved === undefined ? false : exploration.isRemoved,
                                interactionList: exploration.interactionList.map((interaction) => {
                                    if (interaction instanceof ActionInteraction) {
                                        return {
                                            concreteType: "Action",
                                            index: interaction.index,
                                            kind: interaction.action.prefix,
                                            value: interaction.action.suffix,
                                            date: interaction.date
                                        };
                                    }
                                    if (interaction instanceof ObersationInteraction) {
                                        return {
                                            concreteType: "Observation",
                                            index: interaction.index,
                                            kind: interaction.observation.kind,
                                            value: interaction.observation.value,
                                            date: interaction.date
                                        };
                                    }
                            
                                }),
                            };
                        }),
                    });
                } else {
                    logger.debug(`no session ${sessionId}`);
                    res.status(NOT_FOUND_STATUS).send(`no session `);
                }
            })
            .catch((e) => {
                logger.error(`get session error:${e}`);
                res.status(INVALID_PARAMETERS_STATUS).send(`error : ${e}`);
            });
    });


    app.post("/session/update", (req, res) => {
        const { sessionId, webSiteId, baseURL, name, description, overlayType, recordingMode } = req.body;
        logger.info(`update session sessionId ${sessionId}, webSiteId ${webSiteId}, baseURL ${baseURL}, name ${name}, description ${description}, overlayType ${overlayType}, recordingMode ${recordingMode}`);
        if (sessionId === undefined) {
            logger.warn(`sessionId must not be undefined`);
            res.status(INVALID_PARAMETERS_STATUS).send("sessionId is undefined");
            return;
        }
        if (webSiteId === undefined) {
            logger.warn(`webSiteId must not be undefined`);
            res.status(INVALID_PARAMETERS_STATUS).send("webSiteId is undefined");
            return;
        }
        if (baseURL === undefined) {
            logger.warn(`baseURL must not be undefined`);
            res.status(INVALID_PARAMETERS_STATUS).send("baseURL is undefined");
            return;
        }

        if (name === undefined) {
            logger.warn(`name must not be undefined`);
            res.status(INVALID_PARAMETERS_STATUS).send("name is undefined");
            return;
        }

        if (description === undefined) {
            logger.warn(`description must not be undefined`);
            res.status(INVALID_PARAMETERS_STATUS).send("description is undefined");
            return;
        }

        if (recordingMode !== undefined && !Session.getRecordingModes().includes(recordingMode)) {
            logger.warn(`recordingMode must be byexploration or byinteraction`);
            res.status(INVALID_PARAMETERS_STATUS).send("recordingMode is undefined");
            return;
        }

        if (overlayType !== undefined && !Session.getOverlayTypes().includes(overlayType)) {
            logger.warn(`overlayType must be rainbow, bluesky, shadow`);
            res.status(INVALID_PARAMETERS_STATUS).send("Invalid overlayType");
            return;
        }


        sessionService.updateSession(sessionId, name, webSiteId, baseURL, description, overlayType, recordingMode)
            .then(() => {
                logger.debug(`session updated : ${sessionId}`);
                res.json(sessionId);
            })
            .catch((e) => {
                logger.error(`session create error ${e}`);
                res.status(INTERNAL_SERVER_ERROR_STATUS).send(e);
            });
    });

    app.post("/session/:sessionId/exploration/start", (req, res) => {
        const { sessionId } = req.params;
        logger.info(`start a new exploration sessionId ${sessionId}`);
        if (sessionId === undefined) {
            logger.warn(`sessionId must not be undefined`);
            res.status(INVALID_PARAMETERS_STATUS).send("sessionId is undefined");
            return;
        }
        const testerName: string = req.body.testerName;
        sessionService.startExploration(sessionId, testerName)
            .then((explorationNumber) => {
                logger.debug(`exploration/start sessionId ${sessionId} started`);
                res.json(explorationNumber);
            })
            .catch((e) => {
                if ((e instanceof Error) && (e.message === 'wrong sessionId')) {
                    logger.error(`wrong sessionId`);
                    res.status(NOT_FOUND_STATUS).send(`wrong sessionId`);

                } else {
                    logger.error(`exploration/start error ${e}`);
                    res.status(INTERNAL_SERVER_ERROR_STATUS).send("error");
                }

            });
    });

    app.post(`/session/:sessionId/exploration/:exploNumber/stop`, (req, res) => {
        const { sessionId, exploNumber } = req.params;
        logger.info(`exploration/stop sessionId ${sessionId}, explorationNumber ${exploNumber}`);

        if (sessionId === undefined) {
            logger.warn(`sessionId must not be undefined`);
            res.status(INVALID_PARAMETERS_STATUS).send("sessionId is undefined");
            return;
        }
        if (exploNumber === undefined) {
            logger.warn(`explorationNumber must not be undefined`);
            res.status(INVALID_PARAMETERS_STATUS).send("explorationNumber is undefined");
            return;
        }

        const explorationNumberAsNumber: number = parseInt(exploNumber);
        if (isNaN(explorationNumberAsNumber)) {
            logger.error(`exploration/stop ${explorationNumberAsNumber} is NaN`);
            res.status(INVALID_PARAMETERS_STATUS).send("error");
        } else {
            sessionService.stopExploration(sessionId, explorationNumberAsNumber)
                .then(() => {
                    logger.debug(`exploration/stop exploration ${explorationNumberAsNumber} is stopped`);
                    res.sendStatus(SUCCESS_STATUS);
                })
                .catch((e) => {
                    if ((e instanceof Error) && (e.message === 'wrong sessionId')) {
                        logger.error('wrong sessionId');
                        res.status(NOT_FOUND_STATUS).send("wrong sessionId");
                    } else {
                        logger.error(`exploration/stop error ${e}`);
                        res.status(INTERNAL_SERVER_ERROR_STATUS).send("error");
                    }
                });
        }
    });

    app.post(`/session/:sessionId/exploration/:exploNumber/remove`, (req, res) => {
        const { sessionId, exploNumber } = req.params;
        logger.info(`exploration/remove sessionId ${sessionId}, explorationNumber ${exploNumber}`);

        if (sessionId === undefined) {
            logger.warn(`sessionId must not be undefined`);
            res.status(INVALID_PARAMETERS_STATUS).send("sessionId is undefined");
            return;
        }
        if (exploNumber === undefined) {
            logger.warn(`explorationNumber must not be undefined`);
            res.status(INVALID_PARAMETERS_STATUS).send("explorationNumber is undefined");
            return;
        }
        const explorationNumberAsNumber: number = parseInt(exploNumber);
        if (isNaN(explorationNumberAsNumber)) {
            logger.error(`exploration/remove ${explorationNumberAsNumber} is NaN`);
            res.status(INVALID_PARAMETERS_STATUS).send("error");
        } else {
            sessionService.removeExploration(sessionId, explorationNumberAsNumber)
                .then(() => {
                    logger.debug(`exploration/remove exploration ${explorationNumberAsNumber} is removed`);
                    res.sendStatus(SUCCESS_STATUS);
                })
                .catch((e) => {
                    if ((e instanceof Error) && (e.message === 'wrong sessionId')) {
                        logger.error('wrong sessionId');
                        res.status(NOT_FOUND_STATUS).send("wrong sessionId");
                    } else {
                        logger.error(`exploration/remove error ${e}`);
                        res.status(INTERNAL_SERVER_ERROR_STATUS).send("error");
                    }
                });
        }
    })

    app.post("/session/:sessionId/exploration/add", (req, res) => {
        const { sessionId } = req.params;
        const { testerName, interactionList, startDate, stopDate } = req.body;
        logger.info(`add exploration to session ${sessionId}`);
        if (sessionId === undefined) {
            logger.warn(`sessionId must not be undefined`);
            res.status(INVALID_PARAMETERS_STATUS).send("sessionId is undefined");
            return;
        }
        if (interactionList === undefined) {
            logger.warn(`interactionList must not be undefined`);
            res.status(INVALID_PARAMETERS_STATUS).send("interactionList is undefined");
            return;
        }
        sessionService.addExploration(sessionId, testerName, interactionList, startDate, stopDate)
            .then((explorationNumber) => {
                logger.debug(`exploration/add exploration ${explorationNumber} added`);
                res.json(explorationNumber);
            })
            .catch((e) => {
                if ((e instanceof Error) && (e.message === 'wrong sessionId')) {
                    logger.error('wrong sessionId');
                    res.status(NOT_FOUND_STATUS).send("wrong sessionId");
                } else {
                    logger.error(`exploration/add error ${e}`);
                    res.status(INTERNAL_SERVER_ERROR_STATUS).send("error");
                }
            });
    });
    app.post("/session/:sessionId/exploration/:number/pushActionList", (req, res) => {
        let { sessionId, number } = req.params;
        const { interactionList } = req.body;
        logger.info(`update action list of exploration ${number} for session ${sessionId}`);
        if (interactionList === undefined) {
            logger.warn(`interactionList must not be undefined`);
            res.status(INVALID_PARAMETERS_STATUS).send("interactionList is undefined");
            return;
        }
        if (!(interactionList.every((interaction: any) => {
            return "concreteType" in interaction && "kind" in interaction;
        }))) {
            logger.warn("interactionList is malformed :" + JSON.stringify(interactionList))
            res.status(INVALID_PARAMETERS_STATUS).send("interactionList is malformed");
        }
        let explorationNumber: number = Number.parseInt(number)
        if (!Number.isInteger(explorationNumber)) {
            res.status(INVALID_PARAMETERS_STATUS).send("number must be an integer");
            return;
        }
        sessionService.pushActionList(sessionId, explorationNumber, interactionList)
            .then(() => {
                logger.debug(`exploration ${number} updated`);
                res.sendStatus(SUCCESS_STATUS);
            })
            .catch((e: Error) => {
                if (e.message === 'wrong sessionId') {
                    logger.error('wrong sessionId');
                    res.status(NOT_FOUND_STATUS).send("wrong sessionId");
                } else {
                    logger.error(`exploration/pushAction error ${e}`);
                    res.status(INTERNAL_SERVER_ERROR_STATUS).send("error");
                }
            });
    });

    app.get("/session/:sessionId/numberOfTesterExploration/:testerName", (req: Request, res) => {
        logger.info(`numberOfTesterExploration`);
        const { sessionId, testerName } = req.params;
        sessionService.getNumberOfExplorationForTester(sessionId, testerName)
            .then(numberOfExplorations => {
                logger.debug(`numberOfExplorations ${numberOfExplorations}`)
                return res.json({ numberOfExplorations })
            })
            .catch(e => {
                if ((e instanceof Error) && (e.message === 'wrong sessionId')) {
                    logger.error('wrong sessionId');
                    res.status(NOT_FOUND_STATUS).send("wrong sessionId");
                } else {
                    logger.error(`exploration/add error ${e}`);
                    res.status(INTERNAL_SERVER_ERROR_STATUS).send("error");
                }
            })
    });

    app.post("/session/addscreenshotlist", (req, res) => {
        logger.info(`addScreenshotlist`);
        const { screenshotList } = req.body;
        if (screenshotList === undefined || !Array.isArray(screenshotList)) {
            logger.warn(`screenshotList must be an array`);
            res.status(INVALID_PARAMETERS_STATUS).send("screenshotList is not an array");
            return;
        }

        const addPromise = screenshotList.map((screenshot: any) => sessionService.addScreenshot(screenshot.sessionId, screenshot.explorationNumber, screenshot.interactionIndex, screenshot.image));

        Promise.all(addPromise)
            .then(() => {
                logger.debug(`addScreenshotlist ok`);
                res.json({ nbsaved: screenshotList.length });
            })
            .catch((e) => {
                logger.error(`addScreenshotlist error ${e}`);
                res.status(INTERNAL_SERVER_ERROR_STATUS).send(e);
            });
    });

    app.post("/session/addvideo/:sessionId/:explorationNumber", multer().single("video"), (req, res) => {
        const { sessionId, explorationNumber } = req.params;
        const file = req.file;
        logger.info(`addvideo sessionId ${sessionId}, explorationNumber ${explorationNumber}`);
        if (sessionId === undefined) {
            logger.warn(`sessionId must not be undefined`);
            res.status(INVALID_PARAMETERS_STATUS).send("sessionId must not be undefined");
            return;
        }
        if (explorationNumber === undefined) {
            logger.warn(`explorationNumber must not be undefined`);
            res.status(INVALID_PARAMETERS_STATUS).send("explorationNumber must not be undefined");
            return;
        }
        if (file === undefined) {
            logger.warn(`file must not be undefined`);
            res.status(INVALID_PARAMETERS_STATUS).send("file must not be undefined");
            return;
        }

        const explorationNumberAsNumber = parseInt(explorationNumber);
        if (isNaN(explorationNumberAsNumber)) {
            logger.error(`sessionId/explorationNumber error ${explorationNumber} is NaN`);
            res.status(INVALID_PARAMETERS_STATUS).send("wrong exploration number");
        } else {
            if (req.file) {
                const video: Express.Multer.File = file;
                const fileBuffer: Buffer = video.buffer;

                sessionService.addVideo(sessionId, explorationNumberAsNumber, fileBuffer)
                    .then(() => {
                        logger.debug(`sessionId/explorationNumber exploration is returned`);
                        res.json({});
                    })
                    .catch((e) => {
                        logger.error(`sessionId/explorationNumber ${e}`);
                        res.status(INTERNAL_SERVER_ERROR_STATUS).send(e);
                    });
            }
        }
    });

    app.get("/session/:sessionId/screenshotlist", (req, res) => {
        logger.info(`sessionId/screenshotlist`);
        const { sessionId } = req.params;

        if (sessionId === undefined) {
            logger.warn(`sessionId must not be undefined`);
            res.status(INVALID_PARAMETERS_STATUS).send("sessionId must not be undefined");
            return;
        }

        sessionService.findScreenshotBySession(sessionId)
            .then((screenshotList) => {
                logger.debug(`sessionId/screenshotlist return ${screenshotList}`);
                if (screenshotList) {
                    res.json({ screenshotList });
                } else {
                    res.status(NOT_FOUND_STATUS).send();
                }
            })
            .catch((e) => {
                logger.error(`sessionId/screenshotlist ${e}`);
                res.status(INTERNAL_SERVER_ERROR_STATUS).send(e);
            });
    });

    app.get("/session/:sessionId/videolist", (req, res) => {
        logger.info(`sessionId/videolist`);
        const { sessionId } = req.params;

        if (sessionId === undefined) {
            logger.warn(`sessionId must not be undefined`);
            res.status(INVALID_PARAMETERS_STATUS).send("sessionId must not be undefined");
            return;
        }

        sessionService.findVideoBySession(sessionId)
            .then((videoList) => {
                logger.debug(`sessionId/videolist return ${videoList}`);
                if (videoList) {
                    res.json({ videoList });
                } else {
                    res.status(NOT_FOUND_STATUS).send();
                }
            })
            .catch((e) => {
                logger.error(`sessionId/screenshotlist ${e}`);
                res.status(INTERNAL_SERVER_ERROR_STATUS).send(e);
            });
    });

}
