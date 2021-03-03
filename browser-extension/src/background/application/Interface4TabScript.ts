import CommentDistribution from "../domain/CommentDistribution";
import ExplorationEvaluation from "../domain/ExplorationEvaluation";
import Question from "../domain/Question";
import StateForTabScript from "../domain/StateForTabScript";

export default interface Interface4TabScript {

  addAnswerToExploration(question: Question, value: boolean): void;

  getStateForTabScript() : StateForTabScript;

  getProbabilityMap():Map<string, number>;

  getCommentDistributions(): CommentDistribution[];

  processNewAction(kind: string, value: string): Promise<void>;

  setPopupCommentPosition(position : {x: string, y: string}): void;

  getExplorationEvaluation(): ExplorationEvaluation | undefined;

}