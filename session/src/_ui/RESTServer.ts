import bodyParser from "body-parser";
import express, { Request } from "express";
import http from "http";
import sourceMapSupport from "source-map-support";
import SessionService from "../application/SessionService";
import routeRest from "./routeREST";
import {logger} from "../logger";
import morgan from "morgan";
import fs from "fs";
import path from "path";

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

            morgan.token('body', function(req: Request) {
                if (req.method === "POST") {
                    return JSON.stringify(req.body)
                }
            });

            // create a write stream (in append mode)
            var devLogStream = fs.createWriteStream(path.join( __dirname,"..", "..","logs", "combined.log"), { flags: 'a' })
            const morganLogger = morgan('Session   - [:date[clf]] ":method :url HTTP/:http-version" :status :body', {stream: devLogStream})
            app.use(morganLogger);
            app.use(morgan("dev"));
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
