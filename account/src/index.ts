import mongoose from "mongoose";
import RESTServer from "./_ui/RESTServer";
import AccountRepositoryMongo from "./_infra/AccountRepositoryMongo";
import AccountService from "./application/AccountService";
import config from "./_infra/config";
import {logger} from "./logger"
import TokenServiceImpl from "./_infra/TokenServiceImpl";
import CryptoServiceImpl from "./_infra/CryptoServiceImpl";
import PublicAuthorizationRepositoryMongo from "./_infra/PublicAuthorizationRepositoryMongo";



// Init database
connectWithRetry();

const accountRepository = new AccountRepositoryMongo();
const publicAuthorizationRepository = new PublicAuthorizationRepositoryMongo();
const tokenService = new TokenServiceImpl();
const cryptoService = new CryptoServiceImpl();
const accountService = new AccountService(accountRepository, publicAuthorizationRepository, tokenService, cryptoService);

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
