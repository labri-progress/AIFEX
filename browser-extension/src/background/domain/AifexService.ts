import WebSite from "./Website";
import Exploration from "./Exploration";
import Session from "./Session";
import AifexPluginInfo from "./AifexPluginInfo";
import ExplorationEvaluation from "./ExplorationEvaluation";
import Evaluator from "./Evaluator";
import Screenshot from "./Screenshot";
import CommentDistribution from "./CommentDistribution";
import Token from "./Token";

export default interface AifexService {
	ping(serverURL: string): Promise<void>;

	getPluginInfo(serverURL: string): Promise<AifexPluginInfo> ;

	signin(serverURL: string, email: string, password: string): Promise<Token | "Unauthorized">;

	getSession(serverURL : string, sessionId: string, token?: Token): Promise<Session | undefined | "Unauthorized"> ;

	getWebSite(serverURL: string, webSiteId: string, token?: Token): Promise<WebSite | undefined | "Unauthorized"> ;

	hasModel(serverURL: string, modelId: string, token?:Token): Promise<boolean | "Unauthorized"> ;

	getProbabilityMap(
		serverURL: string, 
		modelId: string,
		exploration: Exploration
	): Promise<Map<string, number>> ;

	addExploration(
		serverURL: string, 
		sessionId: string,
		testerName: string,
		exploration: Exploration
	): Promise<number> ;

	getCommentDistributions(serverURL: string, modelId: string, exploration: Exploration): Promise<CommentDistribution[] | undefined> ;

	addScreenshotList(serverURL: string, sessionId: string, explorationNumber : number, list : Screenshot[]): Promise<void> ;

	addVideo(serverURL: string, sessionId: string, explorationNumber:number, video:Blob): Promise<void> ;

	

	evaluateSequence(serverURL: string, webSite: WebSite, exploration: Exploration): Promise<ExplorationEvaluation>;

	getEvaluator(serverURL: string, webSiteId : string) : Promise<Evaluator | undefined>;

	getNumberOfExplorationForTesterName(serverURL: string, sessionId: string, testerName: string): Promise<number>;
}