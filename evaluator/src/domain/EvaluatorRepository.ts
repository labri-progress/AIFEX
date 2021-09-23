import Evaluator from "./Evaluator";
import StepFactory from "../_infra/DFAStepFactory";

export default interface EvaluatorRepository {

    getSequenceEvaluatorByWebSiteId(webSiteId: string, stepFactory: StepFactory): Promise<Evaluator>;
    createSequenceEvaluator(webSiteId: string, description: string, expression: string): Promise<void>;
    updateSequenceEvaluator(webSiteId: string, description: string, expression: string): Promise <void>;
    removeSequenceEvaluator(webSiteId: string): Promise<void>;

}
