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

describe("Session id4", async function() {
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

    describe("Exploration 0: start,Search$smartphone,ItemPictureClick$1,pictureover$1", async function() {
        this.timeout(5000);

        //start
        //Search$smartphone
        await page.waitFor(".hSrcInput > input");
        await page.type(".hSrcInput > input", "smartphone");
        element = await page.evaluateHandle(() => document.activeElement);
        await element.asElement().press("Enter");

        //ItemPictureClick$1
        await page.waitFor("#lpBloc img.prdtBImg");
        await page.click("#lpBloc img.prdtBImg");
        //pictureover$1

        await page.waitFor('.fpZoomPic');
        element = await page.$('.fpZoomPic');
        await element.hover()

    });
});