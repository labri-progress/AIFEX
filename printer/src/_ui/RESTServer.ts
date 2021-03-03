import bodyParser from "body-parser";
import { Express, Request, Response, NextFunction, RequestHandler } from 'express';
import express from "express";
import http from "http";
import SessionService from "../application/PrintService";
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
        // Create server
        const app: Express = express();
        let port: number
        if (process.env.PORT) {
            port = parseInt(process.env.PORT, 10) || this.port;
        } else {
            port = this.port;
        }
        
        const server: http.Server = http.createServer(app);

        // attach routes
        app.use((req : Request, res : Response, next : NextFunction) => {
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
        routeRest(app, this.sessionService);

        // Start server
        server.listen(port, () => {
            logger.info("server is listening on port", this.port);
        });

    }

}
