import ActionsAndElements from "./ActionsAndElements";
import ExplorationEvaluation from "./ExplorationEvaluation";
import Rule from "./Rule";

export default interface ViewManagerService {

    refresh(elementListMatchedByRule: (HTMLElement|SVGElement)[], elementRule: Map<HTMLElement|SVGElement, Rule[]>,  actionAndElements: ActionsAndElements, evaluation: ExplorationEvaluation | undefined): void;

    hide(): Promise<void>;
    
}