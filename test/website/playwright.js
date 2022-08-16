const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({slowMo:1000, headless:false});
  // Create pages, interact with UI elements, assert values
  const page = await browser.newPage();
  await page.goto('http://localhost:8090/');
  await page.click('#gotoB');
  await page.fill('#name', 'Jane');
  await page.fill('#email','pass');
  await page.click('#submit');
  await browser.close();
})();