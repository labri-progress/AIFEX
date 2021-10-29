import bodyParser from "body-parser";
import express from "express";
import http from "http";
import sourceMapSupport from "source-map-support";
import SessionService from "../application/SessionService";
import routeRest from "./routeREST";
import {logger} from "../logger";

export default class RESTServer {

    public port: number;
    public sessionService: SessionService;

    constructor(port : number, sessionService : SessionService) {
        this.port = port;
        this.sessionService = sessionService;
    }

    public start(): void {
        logger.info("RESTServer:start");
        // Create server
        const app  = express();
        let port: number;
        if (process?.env?.PORT) {
            port = parseInt(process.env.PORT, 10);
        } else {
            port = this.port
        }
        const server: http.Server = http.createServer(app);

        // logger
        if (process.env.NODE_ENV === "development") {
            sourceMapSupport.install();
        }

        // attach routes
        app.use((req, res, next) => {
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
            res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");
            res.setHeader("Access-Control-Allow-Credentials", "true");
            next();
        });

        // request parser
        const bodyParserOptions: bodyParser.OptionsJson = {limit: "10mb"};
        app.use(bodyParser.json(bodyParserOptions));
        const bodyParserUrlEncodedOptions: bodyParser.OptionsUrlencoded = {limit: "10mb", extended: true};

        // WebSite route
        routeRest(app, this.sessionService);

        // Start server
        server.listen(port, () => {
            logger.info("session server is listening")
        });

    }

}
