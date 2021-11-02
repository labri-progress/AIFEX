import { Page } from "playwright";

export default class BrowserExtensionPage {
    private _page : Page;
    private _extensionId : string;

    constructor(page : Page, extensionId : string) {
        this._page = page;
        this._extensionId = extensionId;
    }

    async goto() {
        await this._page.goto(`chrome-extension://${this._extensionId}/aifex_page/index.html`, {waitUntil:"domcontentloaded"});
    }

    async joinSession() {
        await this._page.click('#goToJoinSession');
    }

    async connectSession(sessionId : string) {
        await this._page.type('#connexionURLInput', sessionId);
        await this._page.click('#connexionButton');
    }

    async startExploration() {
        await this._page.click('#play-button');
    }

    async stopExploration() {
        await this._page.click('#stop-button');
    }

    

}