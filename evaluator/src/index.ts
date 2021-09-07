import config from "./_infra/config";
import mongoose from "mongoose";
import sourcemap from "source-map-support";
import SequenceEvaluatorRepositoryMongo from "./_infra/EvaluatorRepositoryMongo";
import RESTServer from "./_ui/RESTServer";
import EvaluationApplication from "./application/EvaluationApplication";
import AntlrStepParser from "./_infra/AntlrStepParser";
import {logger} from "./logger";
import EvaluatorRepository from "./domain/EvaluatorRepository";

sourcemap.install();

connectWithRetry();
const sequenceEvaluatorRepositoryMongo: EvaluatorRepository = new SequenceEvaluatorRepositoryMongo();
const stepParser = new AntlrStepParser()
const sequenceConstraintService = new EvaluationApplication(sequenceEvaluatorRepositoryMongo, stepParser);

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
