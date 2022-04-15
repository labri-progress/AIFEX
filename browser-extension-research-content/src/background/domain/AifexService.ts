import Session from "./Session";
import AifexPluginInfo from "./AifexPluginInfo";
import Screenshot from "./Screenshot";
import Action from "./Action";


export default interface AifexService {
	ping(serverURL: string): Promise<void>;

	getPluginInfo(serverURL: string): Promise<AifexPluginInfo> ;

	getSession(serverURL : string, sessionId: string): Promise<Session | undefined | "Unauthorized"> ;

	hasModel(serverURL: string, modelId: string): Promise<boolean | "Unauthorized"> ;

	createEmptyExploration(serverURL: string, sessionId: string, testerName :string): Promise<number>;

	pushActionOrObservationList(serverURL: string, sessionId: string, explorationNumber: number, actions: Action[]): Promise<void>;

	addScreenshotList(serverURL: string, sessionId: string, explorationNumber : number, list : Screenshot[]): Promise<void> ;

	getPluginInfo(serverURL: string): Promise<AifexPluginInfo> ;

	getNumberOfExplorationForTesterName(serverURL: string, sessionId: string, testerName: string): Promise<number>;
}