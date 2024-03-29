import {Page} from 'playwright';

export default class DashboardHomePage {
    private _page : Page;
    private _url : string = 'http://localhost/'

    constructor(page : Page, url?: string) {
        this._page = page;
        this._url = url || this._url;
    }

    async goto() {
        await this._page.goto(this._url);
    }

    async tryForFree() {
        await this._page.click('body > div > div > div.text-center > a');
    }
}