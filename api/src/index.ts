import RESTServer from "./_ui/RESTServer";

import config from "./_infra/config";
import AccountServiceHTTP from "./_infra/AccountServiceHTTP";
import WebSiteServiceHTTP from "./_infra/WebSiteServiceHTTP";
import SessionServiceHTTP from "./_infra/SessionServiceHTTP";
import APIApplication from "./application/APIApplication";
import ModelServiceHTTP from "./_infra/ModelServiceHTTP";
import EvaluatorServiceHTTP from "./_infra/EvaluatorServiceHTTP";
import GeneratorServiceHTTP from "./_infra/GeneratorServiceHTTP";

// Init Services

const accountService = new AccountServiceHTTP();
const webSiteService = new WebSiteServiceHTTP();
const sessionService = new SessionServiceHTTP();
const modelService = new ModelServiceHTTP();
const evaluatorService = new EvaluatorServiceHTTP();
const generatorService = new GeneratorServiceHTTP();
const API = new APIApplication(accountService, webSiteService, sessionService, modelService, evaluatorService, generatorService);

// Create RESTServer

const server = new RESTServer(config.port, API);
server.start();
