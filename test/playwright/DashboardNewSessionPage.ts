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

    async getWebSites() : Promise<string[]>{
        return await this._page.evaluate(() => {
            let webSiteId = document.getElementById('webSiteId');
            if (webSiteId && webSiteId.children) {
                let webSites : string[]= [];
                for (let i = 0; i < webSiteId.children.length; i++) {
                    let webSite = webSiteId.children[i].textContent
                    if ( webSite !== null) {
                        webSites.push(webSite);
                    }
                }
                return webSites;
            } else {
                return [];
            }
        });
    }

    async createSession(name: string, webSite: string, description: string, baseURL: string, overlay: string) {
        await this._page.type('#name', name);
        await this._page.selectOption('#webSiteId',webSite)
        await this._page.type('#description', description);
        await this._page.type('#baseURL', baseURL);
        await this._page.selectOption('#createSessionWithEmptyAI > div:nth-child(6) > div > select', overlay);
        await this._page.click('#createSessionWithEmptyAI > button');
    }

    
}