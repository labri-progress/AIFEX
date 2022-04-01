import BrowserService from "../domain/BrowserService";
import { logger } from "../framework/Logger";

const EXPLORATION_NUMBER_KEY = 'EXPLORATION_NUMBER_KEY';
const INTERACTION_INDEX_KEY = 'INTERACTION_INDEX_KEY';
export default class BrowserServiceSessionStorage implements BrowserService {
	getExplorationNumber(): number | undefined {
        logger.debug("BrowserServiceSessionStorage.getExplorationNumber");
        const explorationNumberItem = sessionStorage.getItem(EXPLORATION_NUMBER_KEY);
        if (explorationNumberItem) {
            const parsedNumber = parseInt(explorationNumberItem);
            if (isNaN(parsedNumber)) {
                logger.debug("BrowserServiceSessionStorage.getExplorationNumber: NaN");
                return undefined;
            } else {
                logger.debug("BrowserServiceSessionStorage.getExplorationNumber: " + parsedNumber);
                return parsedNumber;
            }
        }
        logger.debug("BrowserServiceSessionStorage.getExplorationNumber: undefined");
    }

	saveExplorationNumber(explorationNumber: number): void {
        logger.debug("BrowserServiceSessionStorage.saveExplorationNumber: " + explorationNumber);
        sessionStorage.setItem(EXPLORATION_NUMBER_KEY, explorationNumber.toString());
    }

    getInteractionIndex(): number | undefined {
        const interactionIndex = sessionStorage.getItem(INTERACTION_INDEX_KEY);
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
        sessionStorage.setItem(INTERACTION_INDEX_KEY, interactionIndex.toString());
    }
}