import mongoose from "mongoose";
import RESTServer from "./_ui/RESTServer";
import AccountRepositoryMongo from "./_infra/AccountRepositoryMongo";
import AccountService from "./application/AccountService";
import config from "./config";

// Init database
connectWithRetry();

const accountRepository = new AccountRepositoryMongo();
const accountService = new AccountService(accountRepository);

function connectWithRetry(): Promise<void> {
    console.log(config.database);
    return mongoose.connect(config.database, { useUnifiedTopology: true, useNewUrlParser: true })
        .then(() => {
            console.log("Connecting to database : " + config.database );
        })
        .catch( e => {
            console.log(e);
            setTimeout(connectWithRetry, 1000);
        })
}

// Create RESTServer

const server = new RESTServer(config.port, accountService);
server.start();
