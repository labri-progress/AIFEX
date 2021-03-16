import bodyParser from "body-parser";
import express from "express";
import http from "http";
import morgan from "morgan";
import sourceMapSupport from "source-map-support";
import AccountService from "../domain/AccountService";
import WebSiteService from "../domain/WebSiteService";
import routes from "./routeREST";

import session from "express-session";

const ONE_HOUR = 3600000;

const sess= {
    secret: 'AIFEX super secret',
    resave: true,
    saveUninitialized: true,
    cookie: {    
        secure: false,
        maxAge: ONE_HOUR,
    }
};

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

        app.use((req, res, next) => {
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");
            next();
        });

        // request parser
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: true }));

        if (app.get('env') === 'production') {
            app.set('trust proxy', true); // trust first proxy
            if (process.env.PROTOCOL === 'https') {
                sess.cookie.secure = true; // serve secure cookies
            } else {
                sess.cookie.secure = false; // serve secure cookies
            }
        }
        

        app.use(session(sess));

        // WebSite route
        routes(app, this.accountService, this.webSiteService);

        // Start server
        server.listen(port, () => {
            console.log("server is listening on port", this.port);
        });

    }

}