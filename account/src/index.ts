import mongoose from "mongoose";
import RESTServer from "./_ui/RESTServer";
import AccountRepositoryMongo from "./_infra/AccountRepositoryMongo";
import AccountService from "./application/AccountService";
import config from "./_infra/config";
import {logger} from "./logger"



// Init database
connectWithRetry();

const accountRepository = new AccountRepositoryMongo();
const accountService = new AccountService(accountRepository);

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

const server = new RESTServer(config.port, accountService);
server.start();
