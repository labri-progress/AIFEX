import beautify from "js-beautify";
import Action from "../Action";
import ActionInteraction from "../ActionInteraction";
import ActionToMappingService from "../ActionToMappingService";
import Exploration from "../Exploration";
import Interaction from "../Interaction";
import IPrinter from "../IPrinter";
import Session from "../Session";
import PuppeteerActionMapper from "./PuppeteerActionMapper";
import {logger} from "../../logger";

const DEFAULT_TIMEOUT = 5000;
const DEFAULT_HEADLESS = true;
export default class PuppeteerPrinter implements IPrinter {

    public printSession(session: Session, options: {
      headless?: boolean,
      timeout?: number,
    } = {headless: DEFAULT_HEADLESS, timeout: DEFAULT_TIMEOUT}): string {
      if (options.headless === undefined) {
        options.headless = DEFAULT_HEADLESS;
      }
      if (options.timeout === undefined) {
        options.timeout = DEFAULT_TIMEOUT;
      }

      const assertDeclarationFilename = "";
      const code = [this.buildTestHeader(`Session ${session.id}`, assertDeclarationFilename, options)];

      logger.debug(`there are ${session.explorationList.length} explorations`);

      session.explorationList.forEach((exploration) => {
        let printedExploration = this.printExploration(exploration, session, options);
        code.push(printedExploration);
      });

      code.push(this.buildTestFooter());
      const beautyCode = beautify(code.join(""));
      logger.debug(`beautyCode : ${beautyCode}`);
      return beautyCode;
    }

    public printExploration(exploration: Exploration, session: Session, options : {
      headless?: boolean,
      timeout?: number,
    }): string {
      const description = exploration.interactionList.map((interation: Interaction) => interation.toString());
      const code : string[] = [this.buildTestCaseHeader(`Exploration ${exploration.explorationNumber}: ${description}`)];

      exploration.interactionList.filter((interaction) => interaction instanceof ActionInteraction)
      .forEach((actionInteraction, index) => {
        code.push(`//${actionInteraction.toString()}\n`);
        const code4Interaction = this.printAction((actionInteraction as ActionInteraction).action, session, options);
        if (code4Interaction) {
          code.push( code4Interaction + "\n");
        }
      });
      code.push(this.buildTestCaseFooter());

      return code.join("");
    }

    public printAction(action: Action, session: Session, options? : {
      headless?: boolean,
      timeout?: number,
    }): string | undefined {
      if (session.webSite) {
        const mapping = ActionToMappingService.findMappingForAction(action, session.webSite.mappingList);
        if (mapping) {
          return PuppeteerActionMapper.getActionCode(action, session, mapping);
        }
      }
    }

    private buildTestHeader(description : string, assertDeclarationFilename: string, options : {
      headless?: boolean,
      timeout?: number,
    }): string {
        return `
        const puppeteer = require("puppeteer")
        const expect = require("chai").expect
        ${assertDeclarationFilename ? `const Asserts = require("${assertDeclarationFilename}")` : ""}
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

        describe("${description}", function () {
          this.timeout(${options.timeout});

        `;
      }

    private buildTestFooter(): string {
        return `
        });`;
    }

    private buildTestCaseHeader(description : string): string {
        return `it('${description}', async () => {`;
    }

    private buildTestCaseFooter(): string {
        return `
      });`;
    }
}
