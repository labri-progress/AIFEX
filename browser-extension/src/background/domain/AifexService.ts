import WebSite from "./Website";
import Exploration from "./Exploration";
import Session from "./Session";
import AifexPluginInfo from "./AifexPluginInfo";
import ExplorationEvaluation from "./ExplorationEvaluation";
import Evaluator from "./Evaluator";
import Screenshot from "./Screenshot";
import CommentDistribution from "./CommentDistribution";
import Action from "./Action";

export default interface AifexService {
	getSession(serverURL : string, webSiteId: string): Promise<Session | undefined> ;

	getWebSite(serverURL: string, webSiteId: string): Promise<WebSite | undefined> ;

	hasModel(serverURL: string, modelId: string): Promise<boolean> ;

	getProbabilityMap(
		serverURL: string, 
		modelId: string,
		exploration: Exploration
	): Promise<Map<string, number>> ;

	createFullExploration(
		serverURL: string, 
		sessionId: string,
		testerName: string,
		exploration: Exploration
	): Promise<number> ;

	createEmptyExploration(serverURL: string, sessionId: string, testerName :string): Promise<number>;

	pushActionList(serverURL: string, sessionId: string, explorationNumber: number, actionList: Action[]): Promise<void>;

	notifySubmissionAttempt(serverURL: string, sessionId: string, explorationNumber: number): Promise<void>;

	getCommentDistributions(serverURL: string, modelId: string, exploration: Exploration): Promise<CommentDistribution[] | undefined> ;

	addScreenshotList(serverURL: string, sessionId: string, explorationNumber : number, list : Screenshot[]): Promise<void> ;

	addVideo(serverURL: string, sessionId: string, explorationNumber:number, video:Blob): Promise<void> ;

	getPluginInfo(serverURL: string): Promise<AifexPluginInfo> ;

	evaluateSequence(serverURL: string, evaluator: Evaluator, exploration: Exploration): Promise<ExplorationEvaluation>;

	getEvaluator(serverURL: string, sessionId : string) : Promise<Evaluator | undefined>;

	getNumberOfExplorationForTesterName(serverURL: string, sessionId: string, testerName: string): Promise<number>;
}