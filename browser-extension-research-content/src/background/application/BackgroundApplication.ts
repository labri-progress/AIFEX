import AifexService from "../domain/AifexService";
import Background from "../domain/Background";
import BrowserService from "../domain/BrowserService";
import Observation from "../domain/Observation";
import ObservationDistribution from "../domain/ObservationDistribution";
import CompatibilityCheck from "../domain/CompatibilityCheck";
import ExplorationEvaluation from "../domain/ExplorationEvaluation";
import { PopupPageKind } from "../domain/PopupPageKind";
import PopupService from "../domain/PopupService";
import StateForPopup from "../domain/StateForPopup";
import StateForTabScript from "../domain/StateForTabScript";
import TabScriptService from "../domain/TabScriptService";
import Interface4Popup from "./Interface4Popup";
import Interface4TabScript from "./Interface4TabScript";

export default class BackgroundApplication implements Interface4Popup, Interface4TabScript {
	private _background: Background;

	constructor(browserService: BrowserService, popupService: PopupService, aifexService: AifexService, tabScriptService: TabScriptService) {
		this._background = new Background(aifexService, popupService, browserService, tabScriptService);
	}


	/************************/
	/* For Popup        */
	/************************/

	changePopupPageKind(popupPageKind: PopupPageKind): void {
		return this._background.changePopupPageKind(popupPageKind);
	}

	linkServer(serverURL: any): Promise<"LinkedToServer"> {
		return this._background.linkServer(serverURL);
	}

	unlinkServer(): void {
		return this._background.unlinkServer();
	}

	getStateForPopup(): StateForPopup {
		return this._background.getStateForPopup();
	}

	makeCompatibilityCheck(serverURL: string): Promise<CompatibilityCheck> {
		return this._background.makeCompatibilityCheck(serverURL);
	}

	signin(username: string, password: string): Promise<"SignedIn" | "Unauthorized"> {
		return this._background.signin(username, password);
	}

	connect(serverURL: string, sessionId: string, modelId: string): Promise<"Connected" | "Unauthorized" | "NotFound"> {
		return this._background.connect(serverURL, sessionId, modelId);
	}

	disconnect(): Promise<void> {
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
	
	removeExploration(): Promise<void> {
		return this._background.removeExploration();
	}

	takeScreenShot(): Promise<void> {
		return this._background.takeScreenShot(undefined);
	}

	drawAttention(): Promise<void> {
		
		return this._background.drawAttention();
	}

	setRecordMedia(recordMedia: boolean): Promise<void> {
		return this._background.setRecordMedia(recordMedia);
	}

	setTakeAsScreenshotByAction(takeAScreenshotByAction : boolean) : void {
		return this._background.setTakeAsScreenshotByAction(takeAScreenshotByAction);
	}

	setShouldCreateNewWindowsOnConnect(shouldCreateNewWindowsOnConnect: boolean): void{
		this._background.setShouldCreateNewWindowOnConnect(shouldCreateNewWindowsOnConnect);
	}

	setShouldCloseWindowOnDisconnect(shouldCloseWindowOnDisconnect: boolean): void{
		this._background.setShouldCloseWindowOnDisconnect(shouldCloseWindowOnDisconnect);
	}

	setShouldOpenPrivateWindow(shouldOpenPrivateWindow: boolean): void {
		this._background.setShouldOpenPrivateWindow(shouldOpenPrivateWindow);
	}

	toggleDetachPopup(): Promise<void> {
		return this._background.toggleDetachPopup();
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