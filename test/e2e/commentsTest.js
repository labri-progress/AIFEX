const puppeteer = require('puppeteer');
const { expect } = require('chai');
const {DASHBOARD_HOST, WAIT, PUPPETEER_OPTIONS} = require("./config")


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

describe("Observations", () => {

    describe('initialize connexion', () => {
        let page;
    
        before (async () => {
            page = await browser.newPage();
            await page.goto(`http://${DASHBOARD_HOST}`, {waitUntil:"domcontentloaded"});
            
        });
    
        after (async () => {
            await page.close();
        })

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
            await page.type(BASE_URL_SELECTOR, "https://www.cdiscount.com/");


            const CREATE_BUTTON = '#createSessionWithEmptyAI > button';
            await Promise.all([
                page.waitForNavigation({waitUntil:"domcontentloaded"}),
                page.click(CREATE_BUTTON),
            ]);
            
            const CONNEXION_ID_SELECTOR = '#sessionId';
            await page.waitFor(CONNEXION_ID_SELECTOR, {visible:true, timeout:40000});
            connexionId = await page.$eval(CONNEXION_ID_SELECTOR, input => input.defaultValue);

            expect(connexionId).to.not.be.undefined;
        })
    });

    describe('check plugin installation', () => {
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
        
            await page.waitFor(EXTENSIONS_SELECTOR, {visible:true});
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


    describe('Observations', () => {
        let pageCDiscount;
        let pageExtension;

        const COMMENT_DESCRIPTION_SELECTOR = '#observationDescription';
        const SUBMIT_COMMENT_SELECTOR = "#submitObservation"
        const CLEAR_COMMENT_SELECTOR = "#clearObservation"
        const COMMENT_TYPE_SELECT_SELECTOR = "#observationType"
        const COMMENT_SUCCESSFUL = "#observationSuccessul"
        const RELOAD = "#play-restart"
        const START = "#play-button"
        const STOP = "#stop-button"
        const COMMENT = "Test observation"
        const SEARCH_BAR_SELECTOR = '#hFull > div.hSearch > div.hSrcInput > input';
        const COMMENT_POPUP_HEADER = "#observationSectionHeader"
        const COMMENT_POPUP_BODY = "#observationSectionBody"
        const INIT_SELECTOR = '#initialize';
        const CONNECT_SELECTOR = '#connectionCodeInput';
        const SIGNIN_SELECTOR = '#connectionSignIn';
        const DOM_REGISTERED_CLASS = ".dom_registered"

        before (async () => {
            try {

                pageCDiscount = await browser.newPage();
                pageExtension = await browser.newPage();
                await pageCDiscount.goto(`https://www.cdiscount.com/`, {waitUntil:"domcontentloaded"});
                await pageExtension.bringToFront()
                await pageExtension.goto(`chrome-extension://${extensionId}/popup/popup.html`, {waitUntil:"domcontentloaded"});
                await pageExtension.waitFor(INIT_SELECTOR, {visible:true});
                await pageExtension.click(INIT_SELECTOR);
                await pageExtension.waitFor(CONNECT_SELECTOR, {visible:true});
                await pageExtension.type(CONNECT_SELECTOR, connexionId);
                await pageExtension.click(SIGNIN_SELECTOR);

                await pageExtension.waitFor(STOP, {visible:true})
                await pageExtension.click(STOP)
                await pageExtension.click(START)
            } catch(e) {
                console.log(e)
                assert.fail(e);
            }
        });
    
        after (async () => {
            await pageCDiscount.close();
            await pageExtension.close();
        })

        it('In CDiscount should wait for the overlay and click on searchbar', async () => {
                await pageCDiscount.bringToFront()
                await pageCDiscount.waitFor(DOM_REGISTERED_CLASS, {visible:true});
                await pageCDiscount.waitFor(SEARCH_BAR_SELECTOR, {visible:true});
                await pageCDiscount.click(SEARCH_BAR_SELECTOR)
        });    

        it ('In Extension page should write a observation and click on submit', async() => {
            await pageExtension.bringToFront()

            await pageExtension.waitFor(COMMENT_DESCRIPTION_SELECTOR, {visible:true});
            await pageExtension.type(COMMENT_DESCRIPTION_SELECTOR, COMMENT);

            await pageExtension.select(COMMENT_TYPE_SELECT_SELECTOR, "Simple")

            await pageExtension.click(SUBMIT_COMMENT_SELECTOR)
            await pageExtension.waitFor(COMMENT_SUCCESSFUL, {visible:true});
            let text = await pageExtension.$eval(COMMENT_SUCCESSFUL, mes => mes.innerText);
            expect(text.trim()).to.eql("Observation registered")
        });

       /* it ('In Extension page should reload and in CDiscount click on search bar', async() => {
         try {
            await pageExtension.waitFor(STOP);
            await pageExtension.click(STOP);
            await pageExtension.click(START);
            await pageCDiscount.bringToFront()
            await pageCDiscount.waitFor(3000)

            await pageCDiscount.waitFor(DOM_REGISTERED_CLASS)
            await pageCDiscount.waitFor(SEARCH_BAR_SELECTOR)

            await pageCDiscount.click(SEARCH_BAR_SELECTOR)
            await pageCDiscount.click(SEARCH_BAR_SELECTOR)

            await pageCDiscount.waitFor(COMMENT_POPUP_HEADER);

            let text = await pageCDiscount.$eval(COMMENT_POPUP_HEADER, mes => mes.innerText);
            expect(text.trim()).to.eql("Observations : 1")
        } catch (e) {
            console.error(e)
        }
        });
*/
    });
})