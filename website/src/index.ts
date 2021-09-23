import mongoose from "mongoose";
import WebSiteRepositoryMongo from "./_infra/WebSiteRepositoryMongo";
import RESTServer from "./_ui/RESTServer";
import WebSiteService from "./application/WebSiteService";
import config from "./_infra/config";
import WebSiteRepository from "./domain/WebSiteRepository";
import IdGeneratorServiceWithShortId from "./_infra/IdGeneratorServiceWithShortId";
import {logger} from "./logger";

// Init database
connectWithRetry();

const webSiteRepository: WebSiteRepository = new WebSiteRepositoryMongo();
const webSiteService = new WebSiteService(webSiteRepository);

function connectWithRetry(): Promise<void> {
    return mongoose.connect(config.database)
        .then(() => {
            logger.info("Connecting to database : " + config.database );
        })
        .catch( e => {
          logger.error(e);
          setTimeout(connectWithRetry, 1000);
        })
}

// Create RESTServer
const server = new RESTServer(config.port, webSiteService, new IdGeneratorServiceWithShortId());
server.start();
