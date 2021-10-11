import ActionHighlighter from "../_infra/ActionHighlighter";
import ActionsPopup from "../_infra/ActionPopup";
import EvaluationHighlighter from "../_infra/EvaluationHighlighter";
import ActionsAndElements from "./ActionsAndElements";
import ExplorationEvaluation from "./ExplorationEvaluation";
import Rule from "./Rule";
import HighlighterCanvas from "../_infra/HighlighterCanvas";
import configuration from "../../../configuration.json";


export default class Highlighter {
    private _actionHighlighter : ActionHighlighter;
    private _actionPopup : ActionsPopup;
    private _evaluationActionsBorderView: EvaluationHighlighter;
    private _highlighterCanvas : HighlighterCanvas;

    private elementListMatchedByRule: (HTMLElement|SVGElement)[];
    private elementRules: Map<HTMLElement|SVGElement, Rule[]>  | undefined;
    private actionsAndElements: ActionsAndElements | undefined;
    private evaluation: ExplorationEvaluation | undefined;

    constructor(highlighterCanvas: HighlighterCanvas, actionPopup:ActionsPopup, actionHighlighter: ActionHighlighter, evaluationHighlighter: EvaluationHighlighter) {
        this._highlighterCanvas = highlighterCanvas;
        this._actionPopup = actionPopup;
        this._actionHighlighter = actionHighlighter;
        this._evaluationActionsBorderView = evaluationHighlighter;
        this.elementListMatchedByRule = [];
        this.elementRules = undefined;
        this.actionsAndElements = undefined;
        this.evaluation = undefined;
    }

    refresh(elementListMatchedByRule: (HTMLElement|SVGElement)[], elementRules: Map<HTMLElement|SVGElement, Rule[]>, actionsAndElements: ActionsAndElements, evaluation: ExplorationEvaluation | undefined): Promise<void> {
        return new Promise((resolve) => {
            this.elementListMatchedByRule = elementListMatchedByRule;
            this.elementRules = elementRules;
            this.actionsAndElements = actionsAndElements;
            this.evaluation = evaluation;
            if (configuration.displayCanvas) {
                this._highlighterCanvas.reset()
            }
            this.display();
            resolve();
        })
    }

    private display() {
        if (this.actionsAndElements !== undefined && this.elementRules !== undefined) {
            this._actionHighlighter.show(this.actionsAndElements, this.elementListMatchedByRule, this.elementRules);
            this._actionPopup.show(this.actionsAndElements);
        }
        if (this.evaluation) {
            this._evaluationActionsBorderView.show(this.evaluation);
        }
        if (configuration.displayCanvas) {
            this._highlighterCanvas.show();
        }
    }

    hide(): Promise<void> {
        this._actionPopup.hide();
        this._actionHighlighter.hide();
        this._evaluationActionsBorderView.hide();
        if (configuration.displayCanvas) {
            this._highlighterCanvas.hide();
        }
        return Promise.resolve();
    }


}
