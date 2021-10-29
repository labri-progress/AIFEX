import bodyParser from "body-parser";
import { Express, Request, Response, NextFunction, RequestHandler } from 'express';
import express from "express";
import http from "http";
import sourceMapSupport from "source-map-support";
import ModelService from "../application/ModelService";
import routes from "./routeREST";
import {logger} from "../logger";

export default class RESTServer {
    public port: number;
    public modelService: ModelService;

    constructor(port : number, modelService : ModelService) {
        this.port = port;
        this.modelService = modelService;
    }

    public start():void {
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
            res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
            res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");
            res.setHeader("Access-Control-Allow-Credentials", "true");
            next();
        });

        // request parser
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: true }));

        // WebSite route
        routes(app, this.modelService);

        // Start server
        server.listen(port, () => {
            logger.info(`server is listening on port ${this.port}`);
        });

    }

}
