import { chromium } from 'playwright';
import BrowserExtensionPage from './BrowserExtensionPage';
import ChromeExtensionsPage from './ChromeExtensionsPage';

(async () => {
    const path = require("path")
    let PATH_TO_EXTENSION;
    let DASHBOARD_HOST;


    if (process.env.NODE_ENV === 'github') {
        DASHBOARD_HOST = 'dashboard';
        PATH_TO_EXTENSION = '/browser-extension/dist/chrome';
    } else {
        DASHBOARD_HOST = 'localhost';
        PATH_TO_EXTENSION = path.join(__dirname, '..', '..', '..', 'browser-extension', 'dist', "chrome");
    }

    console.log(PATH_TO_EXTENSION);

    const args = [
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
    //const browser = await chromium.launch(options);
    const browser = await chromium.launchPersistentContext('C:\\tmp',options);
    const page = await browser.newPage();
    //const context = await browser.newContext();
    //const page = await context.newPage();

    const cep = new ChromeExtensionsPage(page);
    await cep.goto();
    const extensionId = await cep.getAIFEXExtensionId();
    await page.waitForTimeout(2000);
    console.log('id',extensionId);

    const page2 = await browser.newPage();
    const be = new BrowserExtensionPage(page2, extensionId);
    await be.goto();
    await page.waitForTimeout(10000);


    await browser.close();
})();