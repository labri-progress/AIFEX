import WebSite from "./Website";
import Exploration from "./Exploration";
import Session from "./Session";
import AifexPluginInfo from "./AifexPluginInfo";
import ExplorationEvaluation from "./ExplorationEvaluation";
import Evaluator from "./Evaluator";
import Screenshot from "./Screenshot";
import CommentDistribution from "./CommentDistribution";
import Token from "./Token";
import Action from "./Action";
import Comment from "./Comment";

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
		exploration: Exploration,
		token?: Token
	): Promise<Map<string, number>> ;

	createFullExploration(
		serverURL: string, 
		sessionId: string,
		testerName: string,
		exploration: Exploration,
		token?: Token
	): Promise<number> ;

	createEmptyExploration(serverURL: string, sessionId: string, testerName :string): Promise<number>;

	pushActionOrCommentList(serverURL: string, sessionId: string, explorationNumber: number, actionOrCommentList: (Action|Comment)[]): Promise<void>;

	notifySubmissionAttempt(serverURL: string, sessionId: string, explorationNumber: number): Promise<void>;

	getCommentDistributions(serverURL: string, modelId: string, exploration: Exploration, token?:Token): Promise<CommentDistribution[] | undefined> ;

	addScreenshotList(serverURL: string, sessionId: string, explorationNumber : number, list : Screenshot[]): Promise<void> ;

	addVideo(serverURL: string, sessionId: string, explorationNumber:number, video:Blob): Promise<void> ;

	getPluginInfo(serverURL: string): Promise<AifexPluginInfo> ;

	evaluateSequence(serverURL: string, evaluator: Evaluator, exploration: Exploration): Promise<ExplorationEvaluation>;

	getEvaluator(serverURL: string, sessionId : string) : Promise<Evaluator | undefined>;

	getNumberOfExplorationForTesterName(serverURL: string, sessionId: string, testerName: string): Promise<number>;
}