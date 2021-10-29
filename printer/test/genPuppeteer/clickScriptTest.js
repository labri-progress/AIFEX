const puppeteer = require("puppeteer")
let browser;
let page;

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

describe("Session id1", async function() {
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

    describe("Exploration 0: start,SearchClick", async function() {
        this.timeout(5000);

        //start
        //SearchClick
        await page.waitFor(".hSrcInput > input");
        await page.click(".hSrcInput > input");

    });
});