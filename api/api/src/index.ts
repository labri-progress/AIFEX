import RESTServer from "./_ui/RESTServer";

import config from "./config";
import AccountServiceHTTP from "./_infra/AccountServiceHTTP";
import WebSiteServiceHTTP from "./_infra/WebSiteServiceHTTP";

// Init Services

const accountService = new AccountServiceHTTP();
const webSiteService = new WebSiteServiceHTTP();

// Create RESTServer

const server = new RESTServer(config.port, accountService, webSiteService);
server.start();
