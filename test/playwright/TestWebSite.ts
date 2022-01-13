import chai from "chai";
import { Browser, BrowserContext, chromium } from 'playwright';
import BrowserExtensionPage from './BrowserExtensionPage';
import ChromeExtensionsPage from './ChromeExtensionsPage';
const expect = chai.expect;
import "mocha";
import DashboardHomePage from "./DashboardHomePage";
import DashboardSignUpPage from "./DashboardSignUpPage";
import DashboardSignInPage from "./DashboardSignInPage";
import DashboardAccountPage from "./DashboardAccountPage";
import path from "path";
import DashboardNewSessionPage from "./DashboardNewSessionPage";
import DashboardSessionPage from "./DashboardSessionPage";
import fs from "fs";


describe("Playwright", () => {

    let browser : BrowserContext;
    //let browser : BrowserContext;
    let PATH_TO_EXTENSION = path.join(__dirname, '..', '..', 'browser-extension', 'dist', "chrome");
    //let DASHBOARD_URL = 'https://aifexpreprod.ovh/';
    let DASHBOARD_URL = 'http://localhost/';
    let TARGET_URL = 'http://localhost:8090/';



    before("creating browser", async () => {     
           
        console.log(PATH_TO_EXTENSION);

        const args = [
            `--disable-extensions-except=${PATH_TO_EXTENSION}`,
            `--load-extension=${PATH_TO_EXTENSION}`,
            '--disable-web-security',
            '--allow-running-insecure-content',
            '--disable-dev-shm-usage',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-gpu',
            
        ]
        //'--allow-http-background-page'
        const options = {
            //executablePath: 'google-chrome-unstable', // set by docker container
            //executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            headless: false,
            devtools: false,
            dumpio: true,
            ignoreHTTPSErrors: true,
            ignoreDefaultArgs: ['--disable-component-extensions-with-background-pages'],
            args: args
        };
        // if (process.env.NODE_ENV === 'github') {
        //     options.executablePath = 'google-chrome-unstable';
        // }

        if (fs.existsSync(path.join(__dirname, 'tmp'))) {
            fs.rmdirSync(path.join(__dirname, 'tmp'), { recursive: true });
        }

        //let chromi = await chromium.launch(options);
        //browser = await chromi.newContext();
        browser = await chromium.launchPersistentContext(path.join(__dirname,"tmp"), options);
        
        
    })

    it("should signin", async () => {
        const page = await browser.newPage();
        const dsip = new DashboardSignInPage(page, DASHBOARD_URL);
        await dsip.goto();
        await dsip.signin('ms', 'ms');
        await page.close();
    })

    it("should create a new public sesion", async () => {
        const page = await browser.newPage();
        const dap = new DashboardAccountPage(page, DASHBOARD_URL);
        await dap.goto();
        let beforeSessions = await dap.getSessions();
        await dap.startNewSession();
        
        const dnsp = new DashboardNewSessionPage(page, DASHBOARD_URL);
        await dnsp.goto();
        const webSites = await dnsp.getWebSites();
        if (webSites.length > 0) {
            await dnsp.createSession("test", webSites[webSites.length-1].value,"description", TARGET_URL);
        }

        await dap.goto();
        let afterSessions = await dap.getSessions();
        expect(afterSessions.length).to.equal(beforeSessions.length + 1);
        await page.close();
    })

    it ("should join connect to a session and create an exploration", async () => {
        let page = await browser.newPage();
        const cep = new ChromeExtensionsPage(page);
        await cep.goto();
        let extensionId = await cep.getAIFEXExtensionId();
        if (extensionId) {
            let dap = new DashboardAccountPage(page, DASHBOARD_URL);
            await dap.goto();
            let sessions = await dap.getSessions();
            if (sessions.length > 0) {
                let url = sessions[sessions.length-1].url;
                let numberOfExplorations = parseInt(sessions[sessions.length-1].numberOfExplorations);
                let bep = new BrowserExtensionPage(page, extensionId);
                let isBEP = await bep.goto();
                if (isBEP) {
                    await bep.createNewWindowsOnConnect(false);
                    await bep.joinSession();                    
                    await bep.connectSession(url);
                    await bep.startExploration();
                    await page.waitForTimeout(2000);

                    //scenario
                    const pages = await browser.pages();
                    //pages[0].on('console', (msg) => console.log('BROWSER LOG:', msg.text()));
                    await pages[0].click("#gotoB");
                    //await pages[0].click("#name");
                    await pages[0].fill("#name", "mynameis");
                    //await pages[0].keyboard.press("Tab");
                    await pages[0].fill("#email", "myemails");
                    //await pages[0].click("body");
                    await pages[0].click("#submit");
                    //end scenario

                    bep = new BrowserExtensionPage(pages[0], extensionId);
                    await bep.goto();
                    await bep.stopExploration();
                    await page.waitForTimeout(2000);
                    page = await browser.newPage();
                    dap = new DashboardAccountPage(page, DASHBOARD_URL);
                    await dap.goto();
                    sessions = await dap.getSessions();
                    let newNumberOfExplorations = parseInt(sessions[sessions.length-1].numberOfExplorations);
                    expect(newNumberOfExplorations).to.equal(numberOfExplorations + 1);
                }
            }
        }
        await page.close();
    })



    after("closing browser", async () => {
        if (browser) {
            await browser.close();
        }
        if (fs.existsSync(path.join(__dirname, 'tmp'))) {
            fs.rmdirSync(path.join(__dirname, 'tmp'), { recursive: true });
        }
    });


});
