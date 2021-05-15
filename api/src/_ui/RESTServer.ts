import bodyParser from "body-parser";
import express from "express";
import http from "http";
import morgan from "morgan";
import sourceMapSupport from "source-map-support";
import cors from 'cors';
import jsonwebtoken from "jsonwebtoken";

import AccountService from "../domain/AccountService";
import WebSiteService from "../domain/WebSiteService";
import routes from "./routeREST";

import SessionService from "../domain/SessionService";
import Token from "../domain/Token";
import config from "../_infra/config";


export default class RESTServer {
    public port: number;
    public accountService: AccountService;
    public webSiteService: WebSiteService;
    public sessionService: SessionService;

    constructor(port : number, accountService : AccountService, webSiteService : WebSiteService, sessionService : SessionService) {
        this.port = port;
        this.accountService = accountService;
        this.webSiteService = webSiteService;
        this.sessionService = sessionService;
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
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: true }));

        // bearer token
        app.use((req, res, next) => {
            const bearerHeader = req.headers['authorization'];
            
            if (bearerHeader) {
                const bearer = bearerHeader.split(' ');
                const bearerToken = bearer[1];
                try {
                    jsonwebtoken.verify(bearerToken, config.tokenSecret);
                    req.token = new Token(bearerToken);
                } catch(e) {
                }
            }
            next();
        })


        // WebSite route
        routes(app, this.accountService, this.webSiteService, this.sessionService);

        // Start server
        server.listen(port, () => {
            console.log("server is listening on port", this.port);
        });

    }

}
