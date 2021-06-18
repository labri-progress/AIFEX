const puppeteer = require("puppeteer")
const expect = require("chai").expect
let browser;
let page;
let element;
let tag;

before(async () => {
    browser = await puppeteer.launch({
        timeout: 10000,
        headless: false
    });
    page = await browser.newPage();
})

after(() => {
    return browser.close()
})

describe("Session id3", async function() {
    this.timeout(5000);


    const puppeteer = require("puppeteer")
    const expect = require("chai").expect
    let browser;
    let page;
    let element;
    let tag;

    before(async () => {
        browser = await puppeteer.launch({
            timeout: 10000,
            headless: false
        });
        page = await browser.newPage();
    })

    after(() => {
        return browser.close()
    })

    describe("Exploration 0: start,Search$smartphone,ChangeSortMode$BESTSALES", async function() {
        this.timeout(5000);

        //start
        //Search$smartphone
        await page.waitFor(".hSrcInput > input");
        await page.type(".hSrcInput > input", "smartphone");
        element = await page.evaluateHandle(() => document.activeElement);
        await element.asElement().press("Enter");

        //ChangeSortMode$BESTSALES

        await page.waitFor('#lpSort > form > select');
        element = await page.$('#lpSort > form > select');
        tag = await element.evaluate((elem) => elem.tagName);
        if (tag === 'SELECT') {
            await element.select('BESTSALES')
        } else {
            await element.type('BESTSALES')
        }

    });
});