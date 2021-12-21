import { Express, Request, Response, NextFunction } from 'express';
import express from "express";
import http from "http";
import sourceMapSupport from "source-map-support";
import ModelService from "../application/ModelService";
import routes from "./routeREST";
import {logger} from "../logger";
import fs from "fs";
import path from "path";
import morgan from "morgan"

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

            morgan.token('body', function(req: Request) {
                if (req.method === "POST") {
                    return JSON.stringify(req.body)
                }
            });

            // create a write stream (in append mode)
            var devLogStream = fs.createWriteStream(path.join( __dirname,"..", "..","logs", "combined.log"), { flags: 'a' })
            const morganLogger = morgan('Model     - [:date[clf]] ":method :url HTTP/:http-version" :status :body', {stream: devLogStream})
            app.use(morganLogger);
            app.use(morgan("dev"));
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
        app.use(express.json());
        app.use(express.urlencoded({
          extended: true
        }));

        // WebSite route
        routes(app, this.modelService);

        // Start server
        server.listen(port, () => {
            logger.info(`server is listening on port ${this.port}`);
        });

    }

}
