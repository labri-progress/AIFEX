import {Page} from 'playwright';

const EXTENSIONS_SELECTOR = 'extensions-manager';

export default class ChromeExtensionsPage {
    private _page : Page;

    constructor(page : Page) {
        this._page = page;
    }

    async goto() {
        await this._page.goto('chrome://extensions/');
    }

    async getNumberOfExtensions() {
        await this._page.waitForSelector(EXTENSIONS_SELECTOR);
        return await this._page.evaluate( () => {
            let manager = document.body.querySelector('extensions-manager').shadowRoot;
            let itemList = manager.getElementById('items-list').shadowRoot;
            let extensionItem = itemList.querySelectorAll('.items-container extensions-item');
            return extensionItem.length;
        });
    }

    async getAIFEXExtensionId() {
        
        await this._page.waitForSelector(EXTENSIONS_SELECTOR);
        return await this._page.evaluate( () => {
            let manager = document.body.querySelector('extensions-manager').shadowRoot;
            let itemList = manager.getElementById('items-list').shadowRoot;
            return itemList.querySelectorAll('.items-container extensions-item')[0].id;
        })
    }


}