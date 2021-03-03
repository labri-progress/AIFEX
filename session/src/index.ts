import mongoose from "mongoose";
import EventStoreRabbit from "./_infra/EventStoreRabbit";
import ScreenshotRepositoryMongoAndFile from "./_infra/ScreenshotRepositoryMongoAndFile";
import SessionRepositoryMongo from "./_infra/SessionRepositoryMongo";
import WebSiteRepositoryMongoREST from "./_infra/WebSiteRepositoryREST";
import RESTServer from "./_ui/RESTServer";
import SessionService from "./application/SessionService";
import config from "./_infra/config";
import VideoRepositoryMongoAndFile from "./_infra/VideoRepositoryMongoAndFile";
import {logger} from "./logger";

// Init database
connectWithRetry();

const webSiteRepository = new WebSiteRepositoryMongoREST();
const sessionRespository = new SessionRepositoryMongo(webSiteRepository);
const eventStore = new EventStoreRabbit();
const screenshotRepository = new ScreenshotRepositoryMongoAndFile();
const videoRepository = new VideoRepositoryMongoAndFile();

const sessionService = new SessionService(sessionRespository, webSiteRepository, eventStore, screenshotRepository, videoRepository);

function connectWithRetry(): Promise<void> {
    return mongoose.connect(config.database, { useUnifiedTopology: true, useNewUrlParser: true })
        .then(() => {
            logger.info("Connecting to database : " + config.database );
        })
        .catch( e => {
          logger.error(e);
          setTimeout(connectWithRetry, 1000);
        })
}

// Create RESTServer
const httpServer = new RESTServer(config.port, sessionService);

httpServer.start();
