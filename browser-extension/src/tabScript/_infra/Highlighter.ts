import ActionProbabilityView from "./ActionProbabilityView";
import ActionsPopupView from "./ActionsPopupView";
import EvaluationActionsBorderView from "./EvaluationActionsBorderView";
import ActionsAndElements from "../domain/ActionsAndElements";
import ExplorationEvaluation from "../domain/ExplorationEvaluation";
import HighlighterService from "../domain/ViewManagerService";
import Rule from "../domain/Rule";
import HighlighterCanvas from "./HighlighterCanvas";


export default class Highlighter implements HighlighterService {
    private _actionProbabilityView : ActionProbabilityView;
    private _actionPopupView : ActionsPopupView;
    private _evaluationActionsBorderView: EvaluationActionsBorderView;
    private _highlighterCanvas : HighlighterCanvas;

    private elementListMatchedByRule: HTMLElement[];
    private elementRules: Map<HTMLElement, Rule[]>  | undefined;
    private actionsAndElements: ActionsAndElements | undefined;
    private evaluation: ExplorationEvaluation | undefined;

    constructor() {
        this._highlighterCanvas = new HighlighterCanvas();
        this._actionPopupView = new ActionsPopupView();
        this._actionProbabilityView = new ActionProbabilityView(this._highlighterCanvas);
        this._evaluationActionsBorderView = new EvaluationActionsBorderView();
        this.elementListMatchedByRule = [];
        this.elementRules = undefined;
        this.actionsAndElements = undefined;
        this.evaluation = undefined;
       
    }

    refresh(elementListMatchedByRule: HTMLElement[], elementRules: Map<HTMLElement, Rule[]>, actionsAndElements: ActionsAndElements, evaluation: ExplorationEvaluation | undefined): void {
        this.elementListMatchedByRule = elementListMatchedByRule;
        this.elementRules = elementRules;
        this.actionsAndElements = actionsAndElements;
        this.evaluation = evaluation;
        
        this._highlighterCanvas.clearHighlight()
        this.display();
    }

    private display() {
        if (this.actionsAndElements !== undefined && this.elementRules !== undefined) {
            this._actionProbabilityView.show(this.actionsAndElements, this.elementListMatchedByRule, this.elementRules);
            this._actionPopupView.show(this.actionsAndElements);
        }
        if (this.evaluation) {
            this._evaluationActionsBorderView.show(this.evaluation);
        }
    }

    hide(): Promise<void> {
        this._actionPopupView.hide();
        this._actionProbabilityView.hide();
        this._evaluationActionsBorderView.hide();
        return Promise.resolve();
    }


}
