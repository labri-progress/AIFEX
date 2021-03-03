import bodyParser from "body-parser";
import http from "http";
import sourceMapSupport from "source-map-support";
import routes from "./routeREST";
import AccountService from "../application/AccountService";
import { Express } from 'express';
import express from "express";
import {logger} from "../logger";

export default class RESTServer {
    public port: number;
    public accountService: AccountService;

    constructor(port: number, accountService : AccountService) {
        this.port = port;
        this.accountService = accountService;
    }

    public start(): void {
        const app: Express = express();
        const port = process.env.PORT || this.port;
        const server = http.createServer(app);

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
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: true }));

        // WebSite route
        routes(app, this.accountService);

        // Start server
        server.listen(port, () => {
            logger.info(`server is listening on port ${this.port}`)
        });

    }

}
