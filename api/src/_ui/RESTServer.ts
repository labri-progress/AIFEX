import express from "express";
import http from "http";
import morgan from "morgan";
import sourceMapSupport from "source-map-support";
import cors from 'cors';
import jsonwebtoken from "jsonwebtoken";

import routes from "./routeREST";

import Token from "../domain/Token";
import config from "../_infra/config";
import APIApplication from "../application/APIApplication";
import { logger } from "../logger";


export default class RESTServer {
    public port: number;
    public api: APIApplication;

    constructor(port : number, api : APIApplication) {
        this.port = port;
        this.api = api;
    }

    public start() {
        // Create server
        const app = express();
        const port = process.env.PORT || this.port;
        const server = http.createServer(app);

        app.use(cors());

        // logger
        if (process.env.NODE_ENV === "dev") {
            app.use(morgan("combined"));
            sourceMapSupport.install();
        }

        app.use((req, res, next) => {
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
            res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");
            res.setHeader("Access-Control-Allow-Credentials", "true");

            next();
        });

        // request parser
        app.use(express.urlencoded({ limit: '50mb', extended: true }));
        app.use(express.json({limit: '50mb'}));

        // bearer token
        app.use((req, res, next) => {
            const bearerHeader = req.headers['authorization'];
            
            if (bearerHeader) {
                const bearer = bearerHeader.split(' ');
                if (bearer.length > 1) {
                    const bearerToken = bearer[1];
                    try {
                        jsonwebtoken.verify(bearerToken, config.tokenSecret);
                        req.token = new Token(bearerToken);
                    } catch(e) {
                    }
                }
            }
            next();
        })


        // WebSite route
        routes(app, this.api);

        // Start server
        server.listen(port, () => {
            logger.info("server is listening on port", this.port);
        });

    }

}
