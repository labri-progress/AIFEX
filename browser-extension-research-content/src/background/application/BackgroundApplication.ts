import AifexService from "../domain/AifexService";
import Background from "../domain/Background";
import BrowserService from "../domain/BrowserService";
import CompatibilityCheck from "../domain/CompatibilityCheck";
import { PopupPageKind } from "../domain/PopupPageKind";
import StateForPopup from "../domain/StateForPopup";
import StateForTabScript from "../domain/StateForTabScript";
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

	changePopupPageKind(popupPageKind: PopupPageKind): void {
		return this._background.changePopupPageKind(popupPageKind);
	}

	getStateForPopup(): StateForPopup {
		return this._background.getStateForPopup();
	}

	makeCompatibilityCheck(serverURL: string): Promise<CompatibilityCheck> {
		return this._background.makeCompatibilityCheck(serverURL);
	}

	connect(serverURL: string, sessionId: string, modelId: string): Promise<"Connected" | "Unauthorized" | "NotFound"> {
		return this._background.connect(serverURL, sessionId, modelId);
	}

	disconnect(): void {
		return this._background.disconnect();
	}

	startExploration(): Promise<void> {
		return this._background.startExploration();
	}

	stopExploration(): Promise<void> {
		return this._background.stopExploration();
	}

	changeTesterName(newName: string): Promise<void> {
		this._background.changeTesterName(newName);
		return this._background.updateNumberOfExplorationByTester();
	}
	
	setTakeAsScreenshotByAction(takeAScreenshotByAction : boolean) : void {
		return this._background.setTakeAsScreenshotByAction(takeAScreenshotByAction);
	}


	setShouldOpenPrivateWindow(shouldOpenPrivateWindow: boolean): void {
		this._background.setShouldOpenPrivateWindow(shouldOpenPrivateWindow);
	}

	showConfig(): void {
		return this._background.showConfig();
	}

	submitConfig(testerName: string, shouldCreateNewWindowsOnConnect: boolean, shouldCloseWindowOnDisconnect: boolean, shouldOpenPrivateWindow: boolean, showProbabilityPopup: boolean): void {
		return this._background.submitConfig(testerName, shouldCreateNewWindowsOnConnect, shouldCloseWindowOnDisconnect, shouldOpenPrivateWindow, showProbabilityPopup);
	}

	cancelConfig(): void {
		return this._background.cancelConfig();
	}

	/************************/
	/* For TabScript        */
	/************************/


	getStateForTabScript(): StateForTabScript {
		return this._background.getStateForTabScript();
	}

	processNewAction(kind: string, value: string): Promise<void> {
		return this._background.processNewAction(kind, value);
	}
}
