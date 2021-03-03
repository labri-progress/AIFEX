import config from "./_infra/config";
import mongoose from "mongoose";
import sourcemap from "source-map-support";
import SequenceEvaluatorRepositoryMongo from "./_infra/SequenceEvaluatorRepositoryMongo";
import RESTServer from "./_ui/RESTServer";
import SequenceEvaluationApplication from "./application/SequenceEvaluationApplication";
import AntlrStepParser from "./_infra/AntlrStepParser";
import {logger} from "./logger";
import SequenceEvaluatorRepository from "./domain/SequenceEvaluatorRepository";

sourcemap.install();

connectWithRetry();
const sequenceEvaluatorRepositoryMongo: SequenceEvaluatorRepository = new SequenceEvaluatorRepositoryMongo();
const stepParser = new AntlrStepParser()
const sequenceConstraintService = new SequenceEvaluationApplication(sequenceEvaluatorRepositoryMongo, stepParser);

function connectWithRetry(): Promise<void> {
  return mongoose.connect(config.database, { useUnifiedTopology: true, useNewUrlParser: true })
  .then(() => {
      logger.info("Connecting to database : " + config.database );
  })
  .catch( (e) => {
    logger.error(e);
    setTimeout(connectWithRetry, 1000);
  })
}

const httpServer = new RESTServer(config.port, sequenceConstraintService);
httpServer.start();
