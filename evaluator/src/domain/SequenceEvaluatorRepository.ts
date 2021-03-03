import SequenceEvaluator from "./SequenceEvaluator";
import StepFactory from "./StepFactory";

export default interface SequenceEvaluatorRepository {

    getSequenceEvaluatorByWebSiteId(webSiteId: string, stepFactory: StepFactory): Promise<SequenceEvaluator | undefined>;
    createSequenceEvaluator(webSiteId: string, description: string, stepFactory: StepFactory, expression: string): Promise<SequenceEvaluator>;
    updateSequenceEvaluator(webSiteId: string, description: string, expression: string): Promise <void>;
    removeSequenceEvaluator(webSiteId: string): Promise<void>;

}
