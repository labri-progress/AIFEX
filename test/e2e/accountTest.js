const puppeteer = require('puppeteer');
const { expect } = require('chai');
const {DASHBOARD_HOST, PUPPETEER_OPTIONS} = require("./config")

const USER = 'test'+Math.random()*1000;


// expose variables
before (async () => {
    browser = await puppeteer.launch(PUPPETEER_OPTIONS);
});

// close browser and reset global variables
after (async () => {
    await browser.close();
});

let browser;

describe("Testing AIFEX Account", () => {

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

    
    it('anonymous is connected', async () => {
        const TOGGLE_BUTTON_SELECTOR = 'body > nav > button';
        await page.waitFor(TOGGLE_BUTTON_SELECTOR, {visible:true});
        await page.click(TOGGLE_BUTTON_SELECTOR);

        const USERNAME_SELECTOR = '#account';
        let username;
    
        await page.waitFor(USERNAME_SELECTOR, {visible:true});
        username = await page.$eval(USERNAME_SELECTOR, usernameDiv => usernameDiv.innerText);
    
        expect(username).to.eql('anonymous');
    });

    it('anonymous should have a website named cdiscount and a session', async function() {
        const USERNAME_SELECTOR = '#account';
        await page.waitFor(USERNAME_SELECTOR, {visible:true});
        await Promise.all([
            page.waitForNavigation(),
            page.click(USERNAME_SELECTOR),
        ]);

        const FIRST_WEBSITE_SELECTOR = '#web-list > tbody > tr > td:nth-child(1)';
        await page.waitFor(FIRST_WEBSITE_SELECTOR, {visible:true});
        const firstWebSiteName = await page.$eval(FIRST_WEBSITE_SELECTOR, firstWebSite => firstWebSite.innerText);
        expect(firstWebSiteName).to.eql('cdiscount');

        const FIRST_SESSION_SELECTOR = '#session-list > tbody > tr:nth-child(1) > td:nth-child(1)';
        await page.waitFor(FIRST_SESSION_SELECTOR, {visible:true});

    });

    it('should create a new account', async () => {
        const TOGGLE_BUTTON_SELECTOR = 'body > nav > button';
        await page.waitFor(TOGGLE_BUTTON_SELECTOR, {visible:true});
        await page.click(TOGGLE_BUTTON_SELECTOR);

        await page.waitFor(1000);

        const SIGNUP_SELECTOR = '#nav-signup';
        await page.waitFor(SIGNUP_SELECTOR , {visible:true});
        await Promise.all([
            page.waitForNavigation(),
            page.click(SIGNUP_SELECTOR),
        ]);

        const USER_FIELD_SELECTOR = '#user';
        await page.waitFor(USER_FIELD_SELECTOR , {visible:true});
        await page.type(USER_FIELD_SELECTOR, USER);

        const PASS_FIELD_SELECTOR = '#password';
        await page.type(PASS_FIELD_SELECTOR, USER);

        const SUBMIT_SELECTOR = '#signup > button';
        await Promise.all([
            page.waitForNavigation(),
            page.click(SUBMIT_SELECTOR),
        ]);

        const CONFIRMATION_MESSAGE_SELECTOR = 'body > div > div';
        await page.waitFor(CONFIRMATION_MESSAGE_SELECTOR);
    })
    
    it('should signin', async () => {
        const USER_FIELD_SELECTOR = '#user';
        await page.type(USER_FIELD_SELECTOR, USER);

        const PASS_FIELD_SELECTOR = '#password';
        await page.type(PASS_FIELD_SELECTOR, USER);

        const SUBMIT_SELECTOR = '#signin > button';
        await Promise.all([
            page.waitForNavigation(),
            page.click(SUBMIT_SELECTOR),
        ]);

        const WEBSITELIST_SELECTOR = '#web-list > tbody';
        await page.waitFor(WEBSITELIST_SELECTOR, {visible:true});
        const nbWebSite = await page.$eval(WEBSITELIST_SELECTOR, webSiteList => webSiteList.childElementCount);
        expect(nbWebSite).to.eql(0);

        const SESSIONLIST_SELECTOR = '#session-list > tbody';
        await page.waitFor(SESSIONLIST_SELECTOR, {visible:true});
        const sessionList = await page.$eval(SESSIONLIST_SELECTOR, sessionList => sessionList.childElementCount);
        expect(sessionList).to.eql(0);
    })

})