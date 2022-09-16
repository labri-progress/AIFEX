import { Page } from "playwright";

export default class BrowserExtensionPage {
    private _page : Page;
    private _extensionId : string;

    constructor(page : Page, extensionId : string) {
        this._page = page;
        this._extensionId = extensionId;
    }

    async goto() {
        await this._page.goto(`chrome-extension://${this._extensionId}/popup/index.html`, {waitUntil:"domcontentloaded"});
        return await this.check();
    }

    async check() {
        await this._page.waitForSelector('#container', {state: 'attached'});
        return await this._page.evaluate(() => {
            if (document.title !== 'AIFEX') {
                return false;
            }
            let container = document.getElementById('container');
            if (container){
                if (container.children.length === 0) {
                    return false;
                }
                let numberOfVisibleComponents = 0;
                for (let index = 0; index < container.children.length; index++) {
                    const child = container.children[index];
                    if (child.getAttribute('style') === 'display: flex;') {
                        numberOfVisibleComponents++;
                    }
                }
                if (numberOfVisibleComponents !== 1) {
                    return false;
                } else {
                    return true;
                }
            } else {
                return false;
            }
        })
    }

    async joinSession() {
        await this._page.click('#goToJoinSession');
    }

    async connectSession(url : string) {
        await this._page.fill('#connexionURLInput', url);
        await this._page.click('#connexionButton');
    }

    async closeDescription(testerName : string) {
        await this._page.fill('#testerNameInDescription', testerName);
        await this._page.click("#sessionDescriptionButton");
    }

    async startExploration() {
        await this._page.click('#play-button');
    }

    async stopExploration() {
        await this._page.click('#stop-button');
    }

    

}