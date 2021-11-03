import AifexService from "../domain/AifexService";
import Background from "../domain/Background";
import BrowserService from "../domain/BrowserService";
import Comment from "../domain/Comment";
import CommentDistribution from "../domain/CommentDistribution";
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

	reloadWebsite(): Promise<void> {
		return this._background.reloadWebsite();
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

	restartExploration(): Promise<void> {
		return this._background.restartExploration();
	}

	removeExploration(): Promise<void> {
		return this._background.removeExploration();
	}

	addCommentToExploration(kind: string , message: string): void{
		this._background.addCommentToExploration(new Comment(kind, message));
	}

	takeScreenShot(): Promise<void> {
		return this._background.takeScreenShot();
	}

	drawAttention(): Promise<void> {
		
		return this._background.drawAttention();
	}

	setRecordMedia(recordMedia: boolean): Promise<void> {
		return this._background.setRecordMedia(recordMedia);
	}

	setShouldCreateNewWindowsOnConnect(shouldCreateNewWindowsOnConnect: boolean): void{
		this._background.setShouldCreateNewWindowOnConnect(shouldCreateNewWindowsOnConnect);
	}

	setShouldCloseWindowOnDisconnect(shouldCloseWindowOnDisconnect: boolean): void{
		this._background.setShouldCloseWindowOnDisconnect(shouldCloseWindowOnDisconnect);
	}

	toggleDetachPopup(): Promise<void> {
		return this._background.toggleDetachPopup();
	}

	/************************/
	/* For TabScript        */
	/************************/


	getStateForTabScript(): StateForTabScript {
		return this._background.getStateForTabScript();
	}

	getProbabilityMap():Map<string, number> {
		return this._background.getProbabilityMap();
	}

	getCommentDistributions(): CommentDistribution[] {
		return this._background.getCommentDistributions();
	}

	processNewAction(kind: string, value: string): Promise<void> {
		return this._background.processNewAction(kind, value);
	}

	upComment(kind: string, value: string): void {
		return this._background.upComment(new Comment(kind, value));
	}

	setPopupCommentPosition(position: {x: string, y: string}): void{
		return this._background.setPopupCommentPosition(position);
	}

	getExplorationEvaluation(): ExplorationEvaluation | undefined {
		return this._background.getExplorationEvaluation();
	}
}
