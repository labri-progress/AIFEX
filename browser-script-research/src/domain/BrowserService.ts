export default interface BrowserService {
	getExplorationNumber(): number | undefined;
	saveExplorationNumber(explorationNumber: number): void;
	getInteractionIndex(): number | undefined;
	saveInteractionIndex(interactionIndex: number): void;
}