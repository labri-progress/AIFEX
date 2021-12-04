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

    async getWebSites() : Promise<{name:string, value:string}[]>{
        return await this._page.evaluate(() => {
            let webSiteId = document.getElementById('webSiteId');
            if (webSiteId && webSiteId.children) {
                let webSites : {name:string, value:string}[]= [];
                for (let i = 0; i < webSiteId.children.length; i++) {
                    let htmlOptionElement = webSiteId.children[i];
                    if (htmlOptionElement instanceof HTMLOptionElement) {
                        let webSiteName = htmlOptionElement.textContent;
                        let webSiteValue = htmlOptionElement.value;
                        if ( webSiteName !== null && webSiteValue !== null) {
                            webSites.push({name:webSiteName, value:webSiteValue});
                        }
                    }
                }
                return webSites;
            } else {
                return [];
            }
        });
    }

    async createSession(name: string, webSite: string, description: string, baseURL: string) {
        await this._page.type('#name', name);
        await this._page.selectOption('#webSiteId',webSite)
        await this._page.type('#description', description);
        await this._page.type('#baseURL', baseURL);
        await this._page.click('#submit');
    }

    
}