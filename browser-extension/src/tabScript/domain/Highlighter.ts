import ActionHighlighter from "../_infra/ActionHighlighter";
import ActionsPopup from "../_infra/ActionPopup";
import EvaluationHighlighter from "../_infra/EvaluationHighlighter";
import ActionsAndElements from "./ActionsAndElements";
import ExplorationEvaluation from "./ExplorationEvaluation";
import Rule from "./Rule";
import HighlighterCanvas from "../_infra/HighlighterCanvas";


export default class Highlighter {
    private _actionProbabilityView : ActionHighlighter;
    private _actionPopupView : ActionsPopup;
    private _evaluationActionsBorderView: EvaluationHighlighter;
    private _highlighterCanvas : HighlighterCanvas;

    private elementListMatchedByRule: HTMLElement[];
    private elementRules: Map<HTMLElement, Rule[]>  | undefined;
    private actionsAndElements: ActionsAndElements | undefined;
    private evaluation: ExplorationEvaluation | undefined;

    constructor(highlighterCanvas: HighlighterCanvas, actionPopup:ActionsPopup, actionHighlighter: ActionHighlighter, evaluationHighlighter: EvaluationHighlighter) {
        this._highlighterCanvas = highlighterCanvas;
        this._actionPopupView = actionPopup;
        this._actionProbabilityView = actionHighlighter;
        this._evaluationActionsBorderView = evaluationHighlighter;
        this.elementListMatchedByRule = [];
        this.elementRules = undefined;
        this.actionsAndElements = undefined;
        this.evaluation = undefined;
       
    }

    refresh(elementListMatchedByRule: HTMLElement[], elementRules: Map<HTMLElement, Rule[]>, actionsAndElements: ActionsAndElements, evaluation: ExplorationEvaluation | undefined): Promise<void> {
        return new Promise((resolve) => {
            this.elementListMatchedByRule = elementListMatchedByRule;
            this.elementRules = elementRules;
            this.actionsAndElements = actionsAndElements;
            this.evaluation = evaluation;
            this._highlighterCanvas.reset()
            this.display();
            resolve();
        })
    }

    private display() {
        if (this.actionsAndElements !== undefined && this.elementRules !== undefined) {
            this._actionProbabilityView.show(this.actionsAndElements, this.elementListMatchedByRule, this.elementRules);
            this._actionPopupView.show(this.actionsAndElements);
        }
        if (this.evaluation) {
            this._evaluationActionsBorderView.show(this.evaluation);
        }
        this._highlighterCanvas.show();
    }

    hide(): Promise<void> {
        this._actionPopupView.hide();
        this._actionProbabilityView.hide();
        this._evaluationActionsBorderView.hide();
        this._highlighterCanvas.hide()
        return Promise.resolve();
    }


}
