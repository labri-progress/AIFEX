import ActionsAndElements from "./ActionsAndElements";
import ExplorationEvaluation from "./ExplorationEvaluation";
import Rule from "./Rule";

export default interface HighlighterService {

    refresh(elementListMatchedByRule: HTMLElement[], elementRule: Map<HTMLElement, Rule[]>,  actionAndElements: ActionsAndElements, evaluation: ExplorationEvaluation | undefined): void;
    hide(): Promise<void>;
    
}