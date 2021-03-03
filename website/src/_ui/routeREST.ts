import Mapping from "../domain/Mapping";
import WebSite from "../domain/WebSite";
import WebSiteService from "../application/WebSiteService";
import IdGeneratorService from "../_infra/IdGeneratorServiceWithShortId";
import { Request, Express, Response } from "express";
import {logger} from "../logger";

const NOT_FOUND_STATUS = 404;
const INVALID_PARAMETERS_STATUS = 400;
const INTERNAL_SERVER_ERROR_STATUS = 500;

export default function attachRoutes(app : Express, webSiteService: WebSiteService, idGeneratorService : IdGeneratorService): void {

    app.get("/website/ping", (req:Request, res: Response) => {
        logger.info(`ping`);
        res.send('alive');
    });

    app.get("/website/:id", (req, res) => {
        const id = req.params.id;
        logger.info(`get website ${id}`);
        // console.log("WebSite GET: ",id);
        if (id === undefined) {
            logger.warn(`id must not be undefined`);
            res.status(INVALID_PARAMETERS_STATUS).send("id is undefined");
            return;
        }
        else {
            webSiteService.findWebSiteById(id)
            .then(webSite => {
                if (webSite === undefined) {
                    logger.debug(`id ${id} not found`);
                    res.status(NOT_FOUND_STATUS).send();
                } else {
                    logger.debug(`id ${id} found and returned`);
                    res.json({
                        id: webSite.id,
                        name: webSite.name,
                        url: webSite.url,
                        mappingList: webSite.mappingList
                    });
                }
            })
            .catch((e) => {
                // tslint:disable-next-line: no-console
                logger.error(`get WebSite id ${id}, error ${e}`);
                res.status(INTERNAL_SERVER_ERROR_STATUS).send(e);
            });
        }
    });

    app.post("/website/create",  (req: Request, res: Response) => {
        const {name, url} = req.body;
        logger.info(`create name ${name}, url ${url}`);
        if (name === undefined) {
            logger.warn(`name must not be undefined`);
            res.status(INVALID_PARAMETERS_STATUS).send("iname is undefined");
            return;
        }
        if (url === undefined) {
            logger.warn(`url must not be undefined`);
            res.status(INVALID_PARAMETERS_STATUS).send("url is undefined");
            return;
        }

        const mappingListData : {
            match: {
                event: string,
                css?: string | undefined,
                xpath?: string | undefined,
                code?: string | undefined,
                key?: string | undefined,
            },
            output: {
                prefix: string,
                suffix?: string
            },
            context?: {
                url?: string,
                css?: string,
                xpath?: string
            },
            description?: string
        }[] = req.body.mappingList;
        const mappingList: Mapping[] = [];
        try {
            mappingListData.forEach((mappingData) => {
                mappingList.push(new Mapping(mappingData.match, mappingData.output, mappingData.context, mappingData.description));
            });
        } catch (e) {
            logger.error(`mapping list error`, e);
            return res.status(INVALID_PARAMETERS_STATUS).send({message: e.message});
        }
        const webSite = new WebSite(idGeneratorService, name, url);
        webSite.addMappingList(mappingList);
        webSiteService.createWebSite(webSite)
        .then(webSiteId => {
            logger.debug(`webSiteId ${webSiteId} created`);
            res.json(webSiteId);
        })
        .catch ((e) => {
            logger.error(`create error`, e);
            res.status(INTERNAL_SERVER_ERROR_STATUS).send({message: e.message});
        });
     });

    app.post("/website/update",  (req: Request, res: Response) => {
        const {id, name, url} = req.body;
        logger.info(`update website (id: ${id}, name: ${name}, url: ${url})`);

        if (id === undefined) {
            logger.warn(`id must not be undefined`);
            res.status(INVALID_PARAMETERS_STATUS).send("id is undefined");
            return;
        }
        if (name === undefined) {
            logger.warn(`name must not be undefined`);
            res.status(INVALID_PARAMETERS_STATUS).send("iname is undefined");
            return;
        }
        if (url === undefined) {
            logger.warn(`url must not be undefined`);
            res.status(INVALID_PARAMETERS_STATUS).send("url is undefined");
            return;
        }
        const mappingListData : {
            match: {
                event: string,
                css?: string | undefined,
                xpath?: string | undefined,
                code?: string | undefined,
                key?: string | undefined,
            },
            output: {
                prefix: string,
                suffix?: string
            },
            context?: {
                url?: string,
                css?: string,
                xpath?: string
            },
            description?: string
        }[] = req.body.mappingList;
        const mappingList: Mapping[] = [];
        try {
            mappingListData.forEach((mappingData) => {
                mappingList.push(new Mapping(mappingData.match, mappingData.output, mappingData.context, mappingData.description));
            });
        } catch (e) {
            logger.error(`update name ${name}, error with mappingList : ${e}`);
            return res.status(INVALID_PARAMETERS_STATUS).send({message: "Invalid mapping file"});
        }
        try {
            const webSite = new WebSite(idGeneratorService, name, url, id);
            webSite.addMappingList(mappingList);
            // console.log('website update:', webSite);
            webSiteService.updateWebSite(webSite)
            .then((webSiteId) => {
                logger.debug(`webSite name ${name} is updated`);
                res.json(webSiteId);
            });
        } catch (e) {
            logger.error(`update name ${name}, error `,e);
            res.status(INTERNAL_SERVER_ERROR_STATUS).send({message: e.message});
        }
    });
}
