import Action from "./Action";

export default interface AifexService {

    getProbabilityMap(
		serverURL: string,
		modelId: string,
		actions: Action[]
	): Promise<Map<string, number>>;

}