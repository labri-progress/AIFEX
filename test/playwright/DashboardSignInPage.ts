//http://localhost/account/signup
import {Page} from 'playwright';

export default class DashboardSignInPage {
    private _page : Page;
    private _url : string = 'http://localhost/'

    constructor(page : Page, url?: string) {
        this._page = page;
        this._url = url || this._url;
    }

    async goto() {
        await this._page.goto(this._url + 'account/signin');
    }

    async signin(login: string, password: string) {
        await this._page.fill('#user', login);
        await this._page.fill('#password', password);
        await this._page.click('#signin > button');
    }

    async gotoSignUp() {
        await this._page.click('body > div > div > row > div > a');
    }
}