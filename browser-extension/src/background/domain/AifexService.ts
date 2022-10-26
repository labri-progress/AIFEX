import Session from "./Session";
import AifexPluginInfo from "./AifexPluginInfo";
import Screenshot from "./Screenshot";
import Action from "./Action";
import Observation from "./Observation";


export default interface AifexService {
	ping(serverURL: string): Promise<void>;

	getPluginInfo(serverURL: string): Promise<AifexPluginInfo> ;

	getSession(serverURL : string, sessionId: string): Promise<Session | undefined | "Unauthorized"> ;

	hasModel(serverURL: string, modelId: string): Promise<boolean | "Unauthorized"> ;

	createEmptyExploration(serverURL: string, sessionId: string, testerName :string): Promise<number>;

	pushActionOrObservationList(serverURL: string, sessionId: string, explorationNumber: number, actionsOrObservations: Array<Action | Observation>): Promise<void>;

	addScreenshotList(serverURL: string, sessionId: string, explorationNumber : number, list : Screenshot[]): Promise<void> ;

	getPluginInfo(serverURL: string): Promise<AifexPluginInfo> ;

	getProbabilities(serverURL: string, modelId: string, actions: Action[]): Promise<[[string, number]]>;

	getOccurences(serverURL: string, modelId: string): Promise<[[string, number]]>;

}