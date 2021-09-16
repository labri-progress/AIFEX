import { querySelectorAllDeep } from 'query-selector-shadow-dom';
import ExplorationEvaluation from '../domain/ExplorationEvaluation';


export default class EvaluationActionsBorderView {

    show(evaluation: ExplorationEvaluation): void {
        this.clear();
        if (!evaluation) {
            return;
        }
        for (const action of evaluation.nextActionList) {
            for (const element of action.htmlElementList) {
                element.setAttribute("aifex_step_action", '')
            }
        }
    }

    hide():void  {
        this.clear();
    }

    private clear():void  {
        const elements = querySelectorAllDeep("[aifex_step_action]");
        for (const element of elements) {
            element.removeAttribute("aifex_step_action");
        }
    }
}