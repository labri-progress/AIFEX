import {Page} from 'playwright';

export default class DashboarSessionPage {
    private _page : Page;
    private _url : string = 'http://localhost/'
    private _key : string | undefined;

    constructor(page : Page, url?: string, key?: string) {
        this._page = page;
        this._url = url || this._url;
        this._key = key;
    }

    async goto() {
        if (this._key) {
            let url = this._url + 'dashboard/session/view/' + this._key;
            await this._page.goto(url);
            return this.check();
        } else {
            return false;
        }
    }

    async check() {
        let url = await this._page.url()
        if (url.lastIndexOf('dashboard/session/view/') === -1) {
            return false;
        } else {
            return true;
        }
    }

    async makeSessionPublic() {
        if (!await this._page.isChecked('#isPublicCheckbox')) {
            await this._page.check('#isPublicCheckbox');
        }
    }

    async makeSessionPrivate() {
        if (await this._page.isChecked('#isPublicCheckbox')) {
            await this._page.uncheck('#isPublicCheckbox');
        }
    }


    
}