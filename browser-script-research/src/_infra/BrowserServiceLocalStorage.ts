import BrowserService from "../domain/BrowserService";
import { logger } from "../framework/Logger";

const EXPLORATION_NUMBER_KEY = 'EXPLORATION_NUMBER_KEY';
const INTERACTION_INDEX_KEY = 'INTERACTION_INDEX_KEY';
export default class BrowserServiceLocalStorage implements BrowserService {
	getExplorationNumber(): number | undefined {
        logger.debug("BrowserServiceLocalStorage.getExplorationNumber");
        const explorationNumberItem = localStorage.getItem(EXPLORATION_NUMBER_KEY);
        if (explorationNumberItem) {
            const parsedNumber = parseInt(explorationNumberItem);
            if (isNaN(parsedNumber)) {
                logger.debug("BrowserServiceLocalStorage.getExplorationNumber: NaN");
                return undefined;
            } else {
                logger.debug("BrowserServiceLocalStorage.getExplorationNumber: " + parsedNumber);
                return parsedNumber;
            }
        }
        logger.debug("BrowserServiceLocalStorage.getExplorationNumber: undefined");
    }

	saveExplorationNumber(explorationNumber: number): void {
        logger.debug("BrowserServiceLocalStorage.saveExplorationNumber: " + explorationNumber);
        localStorage.setItem(EXPLORATION_NUMBER_KEY, explorationNumber.toString());
    }

    getInteractionIndex(): number | undefined {
        const interactionIndex = localStorage.getItem(INTERACTION_INDEX_KEY);
        if (interactionIndex) {
            const parsedNumber = parseInt(interactionIndex);
            if (isNaN(parsedNumber)) {
                return undefined;
            } else {
                return parsedNumber;
            }
        }
    }

    saveInteractionIndex(interactionIndex: number): void {
        localStorage.setItem(INTERACTION_INDEX_KEY, interactionIndex.toString());
    }
}