import http from "http";
import sourceMapSupport from "source-map-support";
import routes from "./routeREST";
import AccountService from "../application/AccountService";
import express, { Express, Request } from 'express';
import {logger} from "../logger";
import fs from "fs";
import path from "path";
import morgan from "morgan";

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

        // logger
        if (process.env.NODE_ENV === "development") {
            sourceMapSupport.install();

            // create a write stream (in append mode)
            var devLogStream = fs.createWriteStream(path.join( __dirname,"..", "..","logs", "combined.log"), { flags: 'a' })
            morgan.token('body', function(req: Request) {
                if (req.method === "POST") {
                    return JSON.stringify(req.body)
                }
            });

            const morganLogger = morgan('Account   - [:date[clf]] ":method :url HTTP/:http-version" :status :body', {stream: devLogStream})
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
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));

        // WebSite route
        routes(app, this.accountService);

        // Start server
        server.listen(port, () => {
            logger.info(`server is listening on port ${this.port}`)
        });

    }

}
