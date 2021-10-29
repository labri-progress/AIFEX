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

describe("Testing Popup", () => {

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


    describe('Testing Popup', () => {
        let page;
        before (async () => {
            page = await browser.newPage();
            await page.goto(`chrome-extension://${extensionId}/popup/popup.html`, {waitUntil:"domcontentloaded"});
        });
    
        after (async () => {
            await page.close();
        })

        describe('Testing connexion', () => {
            it('should open the popup', async () => {
                const HEADING_SELECTOR = 'h2';
                let heading;
            
                await page.waitFor(HEADING_SELECTOR);
                heading = await page.$eval(HEADING_SELECTOR, heading => heading.innerText);
            
                expect(heading).to.eql('AIFEX');
            });

            it ('should connect to the model', async() => {
                const INIT_SELECTOR = '#initialize';
                const SIGNIN_SELECTOR = '#connectionSignIn';
                const CONNECT_SELECTOR = '#connectionCodeInput';

                await page.click(INIT_SELECTOR);

                await page.waitFor(CONNECT_SELECTOR);
                await page.type(CONNECT_SELECTOR, connexionId);
                await page.click(SIGNIN_SELECTOR);
            });
        })
    
        describe("Testing testerName", () => {
            const TEST_NAME_SET = '#testerNameSet';
            const TEST_NAME_UNSET = '#testerNameUnset';
            const TEST_NAME_INPUT = "#testerNameInput"
            const TESTER_NAME = "Bobby"

            it ("should set the testerName", async () => {
                await page.waitFor(2000);

                await page.waitFor(TEST_NAME_INPUT);
                await page.type(TEST_NAME_INPUT, TESTER_NAME);
                await page.click(TEST_NAME_SET);
                const textInput = await page.$eval(TEST_NAME_INPUT, (input) => input.value)

                expect(textInput).eql(TESTER_NAME)
            })

            it ("should reload page, and testerName should still be set", async () => {
                await page.reload({ waitUntil: ["domcontentloaded"] });
                await page.waitFor(TEST_NAME_INPUT);

                const testerName = await page.evaluate((testerNameInputSelector) => {
                    let testerNameInput = document.querySelector(testerNameInputSelector)
                    return testerNameInput.value
                }, TEST_NAME_INPUT)

                expect(testerName).eql(TESTER_NAME)
            })

            it ("should unset the testerName", async () => {
                await page.waitFor(TEST_NAME_UNSET);
                await page.click(TEST_NAME_UNSET);     
            })

            it ("should reload page, and testerName should still be unset", async () => {
                await page.reload({ waitUntil: ["domcontentloaded"] });

                const testerName = await page.evaluate((testerNameInputSelector) => {
                    let testerNameInput = document.querySelector(testerNameInputSelector)
                    return testerNameInput.value
                }, TEST_NAME_INPUT)
                expect(testerName).to.be.empty;
            })
        })
    })
})