const puppeteer = require('puppeteer');
const { expect } = require('chai');
const {DASHBOARD_HOST, PUPPETEER_OPTIONS} = require("./config")


// expose variables
before (async () => {
    browser = await puppeteer.launch(PUPPETEER_OPTIONS);
});

// close browser and reset global variables
after (async () => {
    await browser.close();
});

let browser;
let connexionId;
let extensionId;

const DOM_REGISTERED_CLASS = ".dom_registered"
const SEARCH_BAR_SELECTOR = '#hFull > div.hSearch > div.hSrcInput > input';
const SEARCH_BUTTON = '#hFull > div.hSearch > div.hSrcInput > button';
const CDISCOUNT_URL = "https://www.cdiscount.com/"

describe("Testing CDiscount exploration", () => {

    describe('Dashboard', () => {
        let page;
    
        before (async () => {
            try {
                page = await browser.newPage();
                await page.goto(`http://${DASHBOARD_HOST}`, {waitUntil:"domcontentloaded"});
            } catch(e) {
                console.log('Is localhost down ?');
                console.log(e);
            }
        });
    
        after (async () => {
            try {
                await page.close();
            } catch (e) {
                console.log(e);
            }
        })
    
        it('dashboard title page should be Exploratory Testing', async () => {
            expect(await page.title()).to.eql('Exploratory Testing');
        });
    
        it('dashboard is AIFEX', async () => {
            const HEADING_SELECTOR = 'h1';
            let heading;
        
            await page.waitFor(HEADING_SELECTOR);
            heading = await page.$eval(HEADING_SELECTOR, heading => heading.innerText);
        
            expect(heading).to.eql('AIFEX');
        });

        it('should have a create start from scratch button', async function() {
            const START_FROM_SCRATCH_SELECTOR = '#startfromscratch';
            await page.waitFor(START_FROM_SCRATCH_SELECTOR, {visible:true});
            await Promise.all([
                page.waitForNavigation(),
                page.click(START_FROM_SCRATCH_SELECTOR),
            ]);

            const SITE_ID_SELECTOR = '#webSiteId';
            await page.waitFor(SITE_ID_SELECTOR, {visible:true});
            const value = await page.$$eval('#webSiteId > option', option => option[0].value);

            await page.select(SITE_ID_SELECTOR, value);

            const BASE_URL_SELECTOR = "#baseURL"
            await page.type(BASE_URL_SELECTOR, CDISCOUNT_URL);


            const CREATE_BUTTON = '#createSessionWithEmptyAI > button';
            await Promise.all([
                page.waitForNavigation({waitUntil:"domcontentloaded"}),
                page.click(CREATE_BUTTON),
            ]);
        })
        it('should get a connexion code', async function() {
            try {
                const CONNEXION_ID_SELECTOR = '#sessionId';
                await page.waitFor(CONNEXION_ID_SELECTOR, {visible:true, timeout:40000});
                connexionId = await page.$eval(CONNEXION_ID_SELECTOR, input => input.defaultValue);
                
                expect(connexionId).to.not.be.undefined;
            } catch(e) {
                expect.fail(e)
            }
        })
    });

    describe('Plugin installation', () => {
        let page;

        before (async () => {
            page = await browser.newPage();
            await page.goto(`chrome://extensions/`, {waitUntil:"domcontentloaded"});
        });
        
        after (async () => {
            await page.close();
        });

        it('should have one extension', async () => {

            const EXTENSIONS_SELECTOR = 'extensions-manager';
        
            await page.waitFor(EXTENSIONS_SELECTOR);
            let extensionLength = await page.evaluate( () => {
                let manager = document.body.querySelector('extensions-manager').shadowRoot;
                let itemList = manager.getElementById('items-list').shadowRoot;
                let extensionItem = itemList.querySelectorAll('.items-container extensions-item');
                return extensionItem.length;
            });

            extensionId = await page.evaluate( () => {
                let manager = document.body.querySelector('extensions-manager').shadowRoot;
                let itemList = manager.getElementById('items-list').shadowRoot;
                return itemList.querySelectorAll('.items-container extensions-item')[0].id;
            })

            expect(extensionLength).to.eql(1);

        });
    })


    describe('Link to plugin and browse Cdiscount', () => {
        let pageCDiscount;
        let pageExtension;

    
        before (async () => {
            try {
                pageCDiscount = await browser.newPage();
                pageExtension = await browser.newPage();
                await pageCDiscount.goto(`https://www.cdiscount.com/`, {waitUntil:"domcontentloaded"});
                await pageExtension.goto(`chrome-extension://${extensionId}/popup/popup.html`, {waitUntil:"domcontentloaded"});
            } catch(e) {
                console.log(e);
                assert.fail(e);
            }
        });
    
        after (async () => {
            await pageCDiscount.close();
            await pageExtension.close();
        })

        it('should open the popup', async () => {
            await pageExtension.bringToFront();

            const HEADING_SELECTOR = 'h2';
            let heading;
        
            await pageExtension.waitFor(HEADING_SELECTOR);
            heading = await pageExtension.$eval(HEADING_SELECTOR, heading => heading.innerText);
        
            expect(heading).to.eql('AIFEX');

        });

        it ('should connect to the model and start an exploration', async() => {

            try {
                const INIT_SELECTOR = '#initialize';
                await pageExtension.click(INIT_SELECTOR);
                
                await pageExtension.waitFor("#connectionCodeInput", {visible:true});

                const CONNECT_SELECTOR = '#connectionCodeInput';
                await pageExtension.type(CONNECT_SELECTOR, connexionId);

                const SIGNIN_SELECTOR = '#connectionSignIn';
                await pageExtension.click(SIGNIN_SELECTOR);

                const START_SELECTOR = '#play-button';
                await pageExtension.waitFor(START_SELECTOR, {visible:true});
                await pageExtension.click(START_SELECTOR);
            } catch (e) {
                expect.fail(e)
            } 
        });

        it('should show blue colors', async () => {
            await pageCDiscount.bringToFront();
            
            await pageCDiscount.waitFor(SEARCH_BAR_SELECTOR, {visible:true});
            await pageCDiscount.waitFor(DOM_REGISTERED_CLASS), {visible:true};
            let className = await pageCDiscount.$eval(SEARCH_BAR_SELECTOR, searchBar => searchBar.className);
            expect(className).to.equal('dom_registered');
        });

        it('should show blue colors again', async () => {
            await pageCDiscount.waitFor(SEARCH_BAR_SELECTOR, {visible:true});
            await pageCDiscount.waitFor(DOM_REGISTERED_CLASS, {visible:true});
            let className = await pageCDiscount.$eval(SEARCH_BAR_SELECTOR, searchBar => searchBar.className);
            expect(className).to.equal('dom_registered');
        });

        it('should show blue colors again and again', async () => {
            await pageCDiscount.waitFor(SEARCH_BAR_SELECTOR, {visible:true});
            await pageCDiscount.type(SEARCH_BAR_SELECTOR, 'test');
            await Promise.all([
                pageCDiscount.waitForNavigation({waitUntil:"domcontentloaded"}),
                pageCDiscount.click(SEARCH_BUTTON),
            ]);
            
            await pageCDiscount.waitFor(DOM_REGISTERED_CLASS, {visible:true});
            const CATEGORY = '.lpSelectSort';
            let classNameSelect = await pageCDiscount.$eval(CATEGORY, cat => cat.className);
            expect(classNameSelect).to.contain('dom_registered');

            const CLICK_FIRST_ITEM = '#lpBloc > li:nth-child(2) > div > div > form > div.testLp4x.prdtBILCta > div > div:nth-child(2) > div:nth-child(1) > input.btGreen.btS.jsValidForm';
            await pageCDiscount.click(CLICK_FIRST_ITEM);

            const BASKET_BUTTON = '#hBskt > a';
            pageCDiscount.waitFor(BASKET_BUTTON, {visible:true});
            await Promise.all([
                pageCDiscount.waitForNavigation({waitUntil:"domcontentloaded"}),
                pageCDiscount.click(BASKET_BUTTON)
            ]);

            const ORDER = '.btGreen';
            await pageCDiscount.waitFor(ORDER, {visible:true});

            await pageCDiscount.waitFor(DOM_REGISTERED_CLASS, {visible:true});

            let className = await pageCDiscount.$eval(ORDER, showBasket => showBasket.className);
            expect(className).to.contain('dom_registered');
        });

        it ('should stop the exploration and start a new one', async() => {
            await pageExtension.bringToFront();
            const STOP_SELECTOR = '#stop-button';
            await pageExtension.bringToFront();
            await pageExtension.waitFor(STOP_SELECTOR, {visible:true});
            await pageExtension.click(STOP_SELECTOR);

            const START_SELECTOR = '#play-button';
            await pageExtension.waitFor(START_SELECTOR, {visible:true});
            await pageExtension.click(START_SELECTOR);
        });

        it('should show red colors', async () => {
            await pageCDiscount.bringToFront();
            await pageCDiscount.waitFor(SEARCH_BUTTON, {visible:true});
            await pageCDiscount.waitFor(".often", {visible:true});
            let className = await pageCDiscount.$eval(SEARCH_BUTTON, searchButton => searchButton.className);
            expect(className).to.equal('often');
        });

        it('should show red again colors', async () => {
            await pageCDiscount.waitFor(SEARCH_BAR_SELECTOR, {visible:true});
            
            await pageCDiscount.type(SEARCH_BAR_SELECTOR, 'test');
            
            await Promise.all([
                pageCDiscount.waitForNavigation({waitUntil:"domcontentloaded"}),
                pageCDiscount.click(SEARCH_BUTTON),
            ]);

            await pageCDiscount.waitFor(".often");
            
            const CLICK_FIRST_ITEM = '#lpBloc > li:nth-child(2) > div > div > form > div.testLp4x.prdtBILCta > div > div:nth-child(2) > div:nth-child(1) > input.btGreen.btS.jsValidForm';
            let className = await pageCDiscount.$eval(CLICK_FIRST_ITEM, cat => cat.className);
            expect(className).to.contain('often');

        });
    });

})