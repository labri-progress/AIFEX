const puppeteer = require("puppeteer")
const expect = require("chai").expect

let browser;
let page;
let element;
let tag;

before(async () => {
    browser = await puppeteer.launch({
        timeout: 10000,
        headless: true
    });
    page = await browser.newPage();
})

after(() => {
    return browser.close()
})

describe("Session id0", function() {
    this.timeout(5000);


});