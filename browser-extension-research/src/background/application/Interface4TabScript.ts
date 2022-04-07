import ObservationDistribution from "../domain/ObservationDistribution";
import ExplorationEvaluation from "../domain/ExplorationEvaluation";
import StateForTabScript from "../domain/StateForTabScript";

export default interface Interface4TabScript {

  getStateForTabScript() : StateForTabScript;

  processNewAction(kind: string, value: string): Promise<void>;
  
}