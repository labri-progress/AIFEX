import Interface4UserView from "../application/Interface4UserView";
import ActionProbabilityView from "./ActionProbabilityView";
import ActionsPopupView from "./ActionsPopupView";
import EvaluationActionsBorderView from "./EvaluationActionsBorderView";
import ActionsAndElements from "../domain/ActionsAndElements";
import Comment from "../domain/Comment";
import ExplorationEvaluation from "../domain/ExplorationEvaluation";
import ViewManagerService from "../domain/ViewManagerService";
import {logger} from "../framework/Logger";
import Rule from "../domain/Rule";


export default class ViewManager implements ViewManagerService {
    private _actionProbabilityView : ActionProbabilityView;
    private _actionPopupView : ActionsPopupView;
    private _evaluationActionsBorderView: EvaluationActionsBorderView;

    constructor() {
        this._actionPopupView = new ActionsPopupView();
        this._actionProbabilityView = new ActionProbabilityView();
        this._evaluationActionsBorderView = new EvaluationActionsBorderView();
    }

    refresh(elementListMatchedByRule: HTMLElement[], elementRules: Map<HTMLElement, Rule[]>, actionsAndElements: ActionsAndElements, evaluation: ExplorationEvaluation | undefined): void {
        logger.info('StyleManager refresh');
        this._actionProbabilityView.show(actionsAndElements, elementListMatchedByRule, elementRules);
        this._actionPopupView.show(actionsAndElements);
        if (evaluation) {
            this._evaluationActionsBorderView.show(evaluation);
        }
    }

    hide(): Promise<void> {
        this._actionPopupView.hide();
        this._actionProbabilityView.hide();
        return Promise.resolve();
    }
}
