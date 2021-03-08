import bodyParser from "body-parser";
import express from "express";
import http from "http";
import morgan from "morgan";
import sourceMapSupport from "source-map-support";
import AccountService from "../domain/AccountService";
import WebSiteService from "../domain/WebSiteService";
import routes from "./routeREST";

export default class RESTServer {
    public port: number;
    public accountService: AccountService;
    public webSiteService: WebSiteService;

    constructor(port, accountService, webSiteService) {
        this.port = port;
        this.accountService = accountService;
        this.webSiteService = webSiteService;
    }

    public start() {
        // Create server
        const app = express();
        const port = process.env.PORT || this.port;
        const server = http.createServer(app);

        // logger
        if (process.env.NODE_ENV === "dev") {
            app.use(morgan("combined"));
            sourceMapSupport.install();
        }

        // attach routes
        app.use((req, res, next) => {
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
            res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");
            res.setHeader("Access-Control-Allow-Credentials", true);
            next();
        });

        // request parser
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: true }));

        // WebSite route
        routes(app, this.accountService, this.webSiteService);

        // Start server
        server.listen(port, () => {
            console.log("server is listening on port", this.port);
        });

    }

}
