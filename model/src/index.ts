import mongoose from "mongoose";
import RabbitEventDelegate from "./_infra/RabbitEventDelegate";
import ModelRepositoryMongo from "./_infra/ModelRepositoryMongo";
import SessionRepositoryREST from "./_infra/SessionRepositoryREST";
import RESTServer from "./_ui/RESTServer";
import ModelService from "./application/ModelService";
import config from "./_infra/config";
import {logger} from "./logger";

// Init database
connectWithRetry();

const modelRepository = new ModelRepositoryMongo();
const sessionRepository = new SessionRepositoryREST();
const modelService = new ModelService(modelRepository, sessionRepository);
const eventDelegate = new RabbitEventDelegate();

eventDelegate.subscribe(modelService);

function connectWithRetry(): Promise<void> {
    return mongoose.connect(config.database)
        .then(() => {
            logger.info("Connecting to database : " + config.database );
        });
}

// Create RESTServer

const server = new RESTServer(config.port, modelService);

server.start();
