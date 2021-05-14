import RESTServer from "./_ui/RESTServer";

import config from "./_infra/config";
import AccountServiceHTTP from "./_infra/AccountServiceHTTP";
import WebSiteServiceHTTP from "./_infra/WebSiteServiceHTTP";
import SessionServiceHTTP from "./_infra/SessionServiceHTTP";

// Init Services

const accountService = new AccountServiceHTTP();
const webSiteService = new WebSiteServiceHTTP();
const sessionService = new SessionServiceHTTP();

// Create RESTServer

const server = new RESTServer(config.port, accountService, webSiteService, sessionService);
server.start();
