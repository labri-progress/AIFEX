import Session from "./Session";
import Action from "./Action";


export default interface AifexService {
	getSession(serverURL : string, sessionId: string): Promise<Session | undefined | "Unauthorized"> ;

	createEmptyExploration(testerName: string, serverURL: string, sessionId: string): Promise<number>;

	sendAction(explorationNumber: number, action: Action, serverURL: string, sessionId: string): Promise<void>;

}