import CommentDistribution from "../domain/CommentDistribution";
import ExplorationEvaluation from "../domain/ExplorationEvaluation";
import StateForTabScript from "../domain/StateForTabScript";

export default interface Interface4TabScript {

  getStateForTabScript() : StateForTabScript;

  getProbabilityMap():Map<string, number>;

  getCommentDistributions(): CommentDistribution[];

  processNewAction(kind: string, value: string): Promise<void>;

  getExplorationEvaluation(): ExplorationEvaluation | undefined;

}