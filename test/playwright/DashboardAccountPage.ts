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

    async getSessions() {
        return await this._page.evaluate(() => {
            let results : {name: string, url: string, numberOfExplorations: string}[] = [];
            let sessionCards = document.querySelectorAll('.session-card');
            sessionCards.forEach(sessionCard => {
                let sessionNumberOfExploration = sessionCard.querySelector('.session-exploration .session-value');
                let sessionName = sessionCard.querySelector('.session-configuration .session-value');
                let sessionInput = sessionCard.querySelector('.session-noinput');
                if (sessionNumberOfExploration && sessionName && sessionInput ) {
                    let numberOfExplorations = undefined || sessionNumberOfExploration.textContent;
                    let name = undefined || sessionName.textContent;
                    let url = (sessionInput instanceof HTMLInputElement )?sessionInput.value : undefined;
                    console.log(name, url, numberOfExplorations);
                    if (name && url && numberOfExplorations) {
                        results.push({name: name, url: url, numberOfExplorations: numberOfExplorations});
                    }
                }
            })
            return results;
        });

    }
}