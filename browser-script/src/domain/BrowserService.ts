export default interface BrowserService {
    getExplorationNumber(): number | undefined;
    saveExplorationNumber(explorationNumber: number): void;
}