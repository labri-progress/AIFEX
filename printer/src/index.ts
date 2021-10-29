import SessionRepositoryREST from "./_infra/SessionRepositoryREST";
import RESTServer from "./_ui/RESTServer";
import PrintService from "./application/PrintService";
import config from "./_infra/config";

// Init database

const sessionRespository = new SessionRepositoryREST();
const sessionService = new PrintService(sessionRespository);

// Create RESTServer
const httpServer = new RESTServer(config.port, sessionService);

httpServer.start();
