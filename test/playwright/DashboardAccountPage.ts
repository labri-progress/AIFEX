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
        await this._page.click('#createSessionButton');
    }

    async createNewWebSite() {
        await this._page.click('#createWebListButton');
    }

    async getSessions() {
        return await this._page.evaluate(() => {
            let results : {name: string, url: string, numberOfExplorations: string}[] = [];
            let table = document.querySelector('#session-list');
            if (table) {
                let sessions = table.querySelectorAll('tbody tr');
                sessions.forEach(session => {
                    let tds = session.querySelectorAll('td');
                    if (tds.length >= 3) {
                        let name = (tds[0].firstElementChild instanceof HTMLAnchorElement )?tds[0].firstElementChild.text : undefined;
                        let url = (tds[1].firstElementChild instanceof HTMLInputElement )?tds[1].firstElementChild.value : undefined;
                        let numberOfExplorations = tds[2].textContent;
                        console.log(name, url, numberOfExplorations);
                        if (name && url && numberOfExplorations) {
                            results.push({name: name, url: url, numberOfExplorations: numberOfExplorations});
                        }
                    }
                })
            }
            return results;
        });

    }
}