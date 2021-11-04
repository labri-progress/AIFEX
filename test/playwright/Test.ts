import chai from "chai";
import { BrowserContext, chromium } from 'playwright';
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


describe("Playwright", () => {


    let browser : BrowserContext;
    let PATH_TO_EXTENSION = path.join(__dirname, '..', '..', 'browser-extension', 'dist', "chrome");
    let DASHBOARD_URL = 'http://localhost/';



    before("creating browser", async () => {        
        if (process.env.NODE_ENV === 'github') {
            DASHBOARD_URL = 'http://dashboard/';
            PATH_TO_EXTENSION = '/browser-extension/dist/chrome';
        }

        console.log(PATH_TO_EXTENSION);

        const args = [
            '--disable-web-security',
            `--disable-extensions-except=${PATH_TO_EXTENSION}`,
            `--load-extension=${PATH_TO_EXTENSION}`,
            '--disable-web-security',
            '--allow-running-insecure-content',
            '--disable-dev-shm-usage',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-gpu'
        ]
        const options = {
            //executablePath: 'google-chrome-unstable', // set by docker container
            //executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
            headless: false,
            devtools: false,
            dumpio: true,
            ignoreHTTPSErrors: true,
            args: args
        };
        // if (process.env.NODE_ENV === 'github') {
        //     options.executablePath = 'google-chrome-unstable';
        // }
        //const browser = await chromium.launch(options);
        browser = await chromium.launchPersistentContext(path.join(__dirname,"tmp"), options);
    })

    it("should have one extension, aifex", async () => {
        const page = await browser.newPage();
        const cep = new ChromeExtensionsPage(page);
        await cep.goto();
        expect(await cep.getNumberOfExtensions()).to.equal(1);
        expect(await cep.getAIFEXExtensionId()).to.be.not.empty;
    });

    it("should go to the dashboard and try for free", async () => {
        const page = await browser.newPage();
        const dhp = new DashboardHomePage(page, DASHBOARD_URL);
        await dhp.goto();
        await dhp.tryForFree();
    })

    it("should create a new user", async () => {
        const page = await browser.newPage();
        const dsup = new DashboardSignUpPage(page, DASHBOARD_URL);
        await dsup.goto();
        await dsup.signup('playwright', 'playwright', 'playwright');
    })

    it("should signin", async () => {
        const page = await browser.newPage();
        const dsip = new DashboardSignInPage(page, DASHBOARD_URL);
        await dsip.goto();
        await dsip.signin('playwright', 'playwright');
    })

    it("should create a new sesion", async () => {
        const page = await browser.newPage();
        const dap = new DashboardAccountPage(page, DASHBOARD_URL);
        await dap.goto();
        await dap.startNewSession();

        const dnsp = new DashboardNewSessionPage(page, DASHBOARD_URL);
        await dnsp.goto();
        const webSites = await dnsp.getWebSites();
        console.log(webSites);
        if (webSites.length > 0) {
            await dnsp.createSession("test", webSites[0],"description", "http://test.fr", "rainbow");
        }
    })



    after("closing browser", async () => {
        if (browser) {
            await browser.close();
        }
    });


});
