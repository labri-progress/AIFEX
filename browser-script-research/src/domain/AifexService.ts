import Action from "./Action";
import AifexPluginInfo from "./AifexPluginInfo";
import Session from "./Session";
import Token from "./Token";

export default interface AifexService {
	ping(serverURL: string): Promise<void>;

	getPluginInfo(serverURL: string): Promise<AifexPluginInfo>;

	getSession(serverURL: string, sessionId: string, token: Token | undefined): Promise<Session | undefined | "Unauthorized">;

	createEmptyExploration(testerName: string, serverURL: string, sessionId: string): Promise<number>;
	
	sendAction(explorationNumber: number, action: Action, serverURL: string, sessionId: string): Promise<void>;
}