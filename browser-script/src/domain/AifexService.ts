import Action from "./Action";

export default interface AifexService {
	sendAction(explorationNumber: number, actionList: Action[]): Promise<void>
}