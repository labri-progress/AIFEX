
import beautify from "js-beautify";
import Printer from "./Printer";


export default class PuppeteerPrinter extends Printer {

  protected buildTestHeader(description : string, options : {
      headless?: boolean,
      timeout?: number,
    }): string {
        return `
        const puppeteer = require("puppeteer")
        const expect = require("chai").expect
        let browser;
        let page;
        let element;
        let tag;

        before(async () => {
          browser = await puppeteer.launch({timeout: 10000, headless: ${options.headless}});
          page = await browser.newPage();
        })

        after(() => {
          return browser.close()
        })

        describe("${description}", async function () {
          this.timeout(${options.timeout});

        `;
    }
    
  protected postGen(code: string): string {
    const beautyCode = beautify(code);
    return beautyCode;
  }


  protected buildTestFooter(): string {
    return `
    });`;
  }

  protected buildTestCaseHeader(description : string): string {
      return `it('${description}', async () => {`;
  }

  protected buildTestCaseFooter(): string {
      return `
    });`;
  }

  protected printStartAction(url: string): string {
    return `await page.goto("${url}", {waitUntil: 'load'});`;
  }
  
  protected printClickAction(css: string): string {
      return `await page.waitFor("${css}");
      await page.click("${css}");`;
  }
  
  protected printKeyupAction(keyCode : string): string {
      return `
      element = await page.evaluateHandle(() => document.activeElement);
      await element.asElement().press("${keyCode}");
      `;
  }
  
  protected printTypeAction(css : string, text : string): string {
      return `await page.waitFor("${css}");
      await page.type("${css}", "${text}");`;
  }
  
  protected printChangeAction(css : string, value : string): string {
      return `
      await page.waitFor('${css}');
      element = await page.$('${css}');
      tag = await element.evaluate((elem) => elem.tagName);
      if (tag === 'SELECT') {
          await element.select('${value}')
      }
      else {
          await element.type('${value}')
      }`;
  }
  
  protected printMouseOverAction(css : string): string {
      return `
      await page.waitFor('${css}');
      element = await page.$('${css}');
      await element.hover()`;
  }
  
}
