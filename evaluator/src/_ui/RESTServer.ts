import bodyParser from "body-parser";
import express, { NextFunction } from "express";
import {Express, RequestHandler} from "express"
import http from "http";
import sourceMapSupport from "source-map-support";
import ConstraintService from "../application/EvaluationApplication";
import routeRest from "./routeREST";
import morgan from "morgan";
import {Request, Response} from "express";
import {logger} from "../logger";

export default class RESTServer {
    public port: number;
    public constraintService: ConstraintService;

    constructor(port: number, constraintService: ConstraintService) {
        this.port = port;
        this.constraintService = constraintService;
    }

    public start(): void {
        // Create server
        const app: Express = express();
        const port = process.env.PORT || this.port;
        const server = http.createServer(app);

        // logger
        if (process.env.NODE_ENV === "development") {
            const logger: RequestHandler = morgan("combined")
            app.use(logger);
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
        app.use(bodyParser.json({limit: "10mb"}));
        app.use(bodyParser.urlencoded({limit: "10mb", extended: true}));

        // WebSite route
        routeRest(app, this.constraintService);

        // Start server
        server.listen(port, () => {
            logger.info(`server is listening on port ${this.port}`);
        });

    }

}
