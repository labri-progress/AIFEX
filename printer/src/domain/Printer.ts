import Action from "./Action";
import ActionToMappingService from "./ActionToMappingService";
import Exploration from "./Exploration";
import Session from "./Session";

import {logger} from "../logger";
import Interaction from "./Interaction";
import ActionInteraction from "./ActionInteraction";
import Mapping from "./Mapping";

const DEFAULT_TIMEOUT = 5000;
const DEFAULT_HEADLESS = true;
export default abstract class Printer {

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
  
        const code = [this.buildTestHeader(`Session ${session.id}`, options)];
  
        logger.debug(`there are ${session.explorationList.length} explorations`);
  
        session.explorationList.forEach((exploration: Exploration) => {
            let printedExploration = this.printExploration(exploration, session, options);
            if (printedExploration) {
                code.push(printedExploration);
            }
        });
  
        code.push(this.buildTestFooter());
        const beautyCode = this.postGen(code.join(""));
        logger.debug(`beautyCode : ${beautyCode}`);
        return beautyCode;
      }
    
    private printExploration(exploration: Exploration, session: Session, options : {
      headless?: boolean,
      timeout?: number,
    }): string {
      const description = exploration.interactionList.map((interation: Interaction) => interation.toString());
      const code : string[] = [this.buildTestHeader(`Exploration ${exploration.explorationNumber}: ${description}`, options)];

      exploration.interactionList.filter((interaction) => interaction instanceof ActionInteraction)
      .forEach((actionInteraction, index) => {
        code.push(`//${actionInteraction.toString()}\n`);
        const code4Interaction = this.printAction((actionInteraction as ActionInteraction).action, session, options);
        if (code4Interaction) {
          code.push( code4Interaction + "\n");
        }
      });
      code.push(this.buildTestFooter());

      return code.join("");
    }

    protected printAction(action: Action, session: Session, options? : {
        headless?: boolean,
        timeout?: number,
      }): string | undefined {
        if (session.webSite) {
          const mapping = ActionToMappingService.findMappingForAction(action, session.webSite.mappingList);
          if (mapping) {
            return this.getActionCode(action, session, mapping);
          }
        }
    }

    private getActionCode(action: Action, session: Session, mapping: Mapping): string | undefined{

      if (action.kind === "start") {
          return this.printStartAction(session.baseURL);
      }
      if (action.kind === "end") {
          return "";
      }

      switch (mapping.match.event) {
          case "click":
              return this.printClickAction(mapping.match.css);
          case "keyup":
              if (mapping.output.suffix === "value") {
                  if (action.value && mapping.match.code) {
                      return this.printTypeAction(mapping.match.css, action.value) + this.printKeyupAction(mapping.match.code);
                  } else {
                      return;
                  }
              } else {
                  if (mapping.match.code) {
                      return this.printKeyupAction(mapping.match.code);
                  } else {
                      return;
                  }
              }
          case "mouseover":
              return this.printMouseOverAction(mapping.match.css);
          case "change":
              if (action.value) {
                  return this.printChangeAction(mapping.match.css, action.value);
              } else {
                  return;
              }
              
          default:
              throw new Error(`NotHandledEventTypeError Event type ${mapping.match.event} is not handled`);
      }
  }

    protected postGen(code: string): string {
      return code
    }

    protected abstract buildTestHeader(description : string, options : {
        headless?: boolean,
        timeout?: number,
      }): string
    protected abstract buildTestFooter(): string;
    protected abstract printStartAction(url: string): string;
    protected abstract printClickAction(css: string): string;
    protected abstract printKeyupAction(keyCode : string): string;
    protected abstract printMouseOverAction(css : string): string;
    protected abstract printTypeAction(css : string, text : string): string;
    protected abstract printChangeAction(css : string, value : string): string;
}