import mongoose from "mongoose";
import SessionRepositoryREST from "./_infra/SessionRepositoryREST";
import RESTServer from "./_ui/RESTServer";
import config from "./_infra/config";
import {logger} from "./logger";
import GeneratorService from "./application/GeneratorService";

// Init database
connectWithRetry();

const sessionRepository = new SessionRepositoryREST();
const generatorService = new GeneratorService(sessionRepository);

function connectWithRetry(): Promise<void> {
    return mongoose.connect(config.database)
        .then(() => {
            logger.info("Connecting to database : " + config.database );
        })
        .catch((err) => {
            logger.error('Connection to database failed.');
            setTimeout(connectWithRetry, 2000);
        })
}

// Create RESTServer

const server = new RESTServer(config.port, generatorService);

server.start();
