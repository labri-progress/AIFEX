import AifexService from "../domain/AifexService";
import Background from "../domain/Background";
import BrowserService from "../domain/BrowserService";
import CompatibilityCheck from "../domain/CompatibilityCheck";
import Interface4Popup from "./Interface4Popup";
import Interface4TabScript from "./Interface4TabScript";

export default class BackgroundApplication implements Interface4Popup, Interface4TabScript {
	private _background: Background;

	constructor(browserService: BrowserService, aifexService: AifexService) {
		this._background = new Background(aifexService, browserService);
	}


	/************************/
	/* For Popup        */
	/************************/

	makeCompatibilityCheck(serverURL: string): Promise<CompatibilityCheck> {
		return this._background.makeCompatibilityCheck(serverURL);
	}

	connect(serverURL: string, sessionId: string, modelId: string): Promise<"Connected" | "Unauthorized" | "NotFound"> {
		return this._background.connect(serverURL, sessionId, modelId);
	}

	startExploration(): Promise<void> {
		return this._background.startExploration();
	}

	stopExploration(): Promise<void> {
		return this._background.stopExploration();
	}

	processNewObservation(kind: string , message: string): Promise<void> {
		return this._background.processNewObservation(kind, message);
	}


	/************************/
	/* For TabScript        */
	/************************/

	processNewAction(kind: string, value: string): Promise<void> {
		return this._background.processNewAction(kind, value);
	}
}
