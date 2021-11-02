import { chromium } from 'playwright';
import ChromeExtensionPage from './ChromeExtensionsPage';

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    const cep = new ChromeExtensionPage(page);
    await cep.goto();
    await page.waitForTimeout(3000)
    await browser.close();
})();