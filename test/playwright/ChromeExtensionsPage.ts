import {Page} from 'playwright';

export default class ChromeExtensionPage {
    private _page : Page;

    constructor(page : Page) {
        this._page = page;
    }

    async goto() {
        await this._page.goto('chrome://extensions/');
    }


}