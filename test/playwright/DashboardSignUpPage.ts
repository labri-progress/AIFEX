//http://localhost/account/signup
import {Page} from 'playwright';

export default class DashboardSignUpPage {
    private _page : Page;
    private _url : string = 'http://localhost/'

    constructor(page : Page, url?: string) {
        this._page = page;
        this._url = url || this._url;
    }

    async goto() {
        await this._page.goto(this._url + 'account/signup');
    }

    async signup(login: string, password: string, email: string) {
        await this._page.type('#user', login);
        await this._page.type('#password', password);
        await this._page.type('#email', email);
        await this._page.click('#signup > button');
    }
}