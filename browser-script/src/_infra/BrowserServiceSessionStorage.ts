import BrowserService from "../domain/BrowserService";
import { logger } from "../framework/Logger";

const EXPLORATION_NUMBER_KEY = 'EXPLORATION_NUMBER_KEY';
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
}