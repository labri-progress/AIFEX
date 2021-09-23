import { querySelectorAllDeep } from 'query-selector-shadow-dom';
import ExplorationEvaluation from '../domain/ExplorationEvaluation';
import HighlighterCanvas from './HighlighterCanvas';


export default class EvaluationActionsBorderView {

    private _highlighterCanvas: HighlighterCanvas;

    constructor(highlighterCanvas: HighlighterCanvas) {
        this._highlighterCanvas = highlighterCanvas;       
    }

    show(evaluation: ExplorationEvaluation): void {
        this.hide();
        this._highlighterCanvas.clearAnimatedElements();
        for (const action of evaluation.nextActionList) {
            for (const element of action.htmlElementList) {
                element.setAttribute("aifex_step_action", '')
                this._highlighterCanvas.animateElement(element);
            }
        }
    }

    hide():void  {
        const elements = querySelectorAllDeep("[aifex_step_action]");
        for (const element of elements) {
            element.removeAttribute("aifex_step_action");
        }    
    }

}