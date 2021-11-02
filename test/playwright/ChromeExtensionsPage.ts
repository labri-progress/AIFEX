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
            const extensionManager = document.body.querySelector('extensions-manager')
            if (extensionManager && extensionManager.shadowRoot) {
                let manager = extensionManager.shadowRoot;
                const itemList = manager.getElementById('items-list');
                if (itemList && itemList.shadowRoot) {
                    let extensionItem = itemList.shadowRoot.querySelectorAll('.items-container extensions-item');
                    if (extensionItem) {
                        return extensionItem.length;
                    } else {
                        return 0;
                    }
                } else {
                    return 0;
                }
            } else {
                return 0;
            }
        });
    }

    async getAIFEXExtensionId() : Promise<string|undefined> {
        await this._page.waitForSelector(EXTENSIONS_SELECTOR);
        return await this._page.evaluate( () => {
            let manager = document.body.querySelector('extensions-manager');
            if (manager && manager.shadowRoot) {
                let itemList = manager.shadowRoot.getElementById('items-list');
                if (itemList && itemList.shadowRoot) {
                    return itemList.shadowRoot.querySelectorAll('.items-container extensions-item')[0].id;
                }
            }
        })
    }


}