import {Page} from 'playwright';

export default class DashboardAccountPage {
    private _page : Page;
    private _url : string = 'http://localhost/'

    constructor(page : Page, url?: string) {
        this._page = page;
        this._url = url || this._url;
    }

    async goto() {
        await this._page.goto(this._url + 'account/account');
    }

    async startNewSession() {
        await this._page.click('body > div > div > a:nth-child(7)');
    }

    async createNewWebSite() {
        await this._page.click('body > div > div > a:nth-child(11)');
    }
}