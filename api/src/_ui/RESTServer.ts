import express, {Request} from "express";
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
import fs from "fs";
import path from "path";


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
        app.use(express.urlencoded({ limit: '50mb', extended: true }));
        app.use(express.json({limit: '50mb'}));

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
            const morganLogger = morgan('API       - [:date[clf]] ":method :url HTTP/:http-version" :status :body', {stream: devLogStream})
            app.use(morganLogger);
            app.use(morgan("dev"));
        }

        app.use((req, res, next) => {
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
            res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");
            res.setHeader("Access-Control-Allow-Credentials", "true");

            next();
        });



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
