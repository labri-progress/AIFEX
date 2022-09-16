import {Page} from 'playwright';

export default class DashboardNewSessionPage {
    private _page : Page;
    private _url : string = 'http://localhost/'

    constructor(page : Page, url?: string) {
        this._page = page;
        this._url = url || this._url;
    }

    async goto() {
        await this._page.goto(this._url + 'dashboard/session/create');
    }

    async skipTuto() {
        let skipButton = await this._page.$('.introjs-skipbutton');
        if (skipButton) {
            skipButton.click();
        }
    }

    async createSession(name: string, baseURL: string, description: string ) {
        await this._page.fill('#name', name);
        await this._page.fill('#baseURL', baseURL);
        await this._page.fill('#description', description);
        await this._page.click('#submit');
    }

    
}