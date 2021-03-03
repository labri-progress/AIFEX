import http from "http";
import sourceMapSupport from "source-map-support";
import WebSiteService from "../application/WebSiteService";
import IdGeneratorService from "../_infra/IdGeneratorServiceWithShortId";
import routes from "./routeREST";
import bodyParser from "body-parser";
import { Express, Request, Response, NextFunction, RequestHandler } from 'express';
import express from "express";
import {logger} from "../logger";

export default class RESTServer {

    public port: number;
    public webSiteService: WebSiteService;
    public idGeneratorService : IdGeneratorService;

    constructor(port : number, webSiteService : WebSiteService, idGeneratorService : IdGeneratorService) {
        this.port = port;
        this.webSiteService = webSiteService;
        this.idGeneratorService = idGeneratorService;
    }

    public start(): void {
        // Create server
        const app: Express = express();
        const port = process.env.PORT || this.port;
        const server = http.createServer(app);

        // logger
        if (process.env.NODE_ENV === "development") {
            sourceMapSupport.install();
        }

        // attach routes
        app.use((req: Request, res: Response, next: NextFunction) => {
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Methods", "GET, POST");
            res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");
            res.setHeader("Access-Control-Allow-Credentials", "true");
            next();
        });

        // request parser
        app.use(bodyParser.json({limit:'50MB'}));

        app.use(bodyParser.urlencoded({ extended: true }));

        // WebSite route
        routes(app, this.webSiteService, this.idGeneratorService);

        // Start server
        server.listen(port, () => {
            logger.info(`server is listening ${this.port}`);
        });

    }
}
