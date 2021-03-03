import Action from "../Action";
import Mapping from "../Mapping";
import Session from "../Session";

// Value Object
export default class PuppeteerActionMapper {

    public static getActionCode(action: Action, session: Session, mapping: Mapping): string | undefined{

        if (action.kind === "start") {
            return makeStartAction(session.baseURL);
        }
        if (action.kind === "end") {
            return "";
        }

        switch (mapping.match.event) {
            case "click":
                return makeClickAction(mapping.match.css);
            case "keyup":
                if (mapping.output.suffix === "value") {
                    if (action.value && mapping.match.code) {
                        return makeTypeAction(mapping.match.css, action.value) + makeKeyupAction(mapping.match.code);
                    } else {
                        return;
                    }
                } else {
                    if (mapping.match.code) {
                        return makeKeyupAction(mapping.match.code);
                    } else {
                        return;
                    }
                }
            case "mouseover":
                return makeMouseOverAction(mapping.match.css);
            case "change":
                if (action.value) {
                    return makeChangeAction(mapping.match.css, action.value);
                } else {
                    return;
                }
                
            default:
                throw new Error(`NotHandledEventTypeError Event type ${mapping.match.event} is not handled`);
        }
    }
}

function makeStartAction(url: string): string {
    return `await page.goto("${url}", {waitUntil: 'load'});`;
}

function makeClickAction(css: string): string {
    return `await page.waitFor("${css}");
    await page.click("${css}");`;
}

function makeKeyupAction(keyCode : string): string {
    return `
    element = await page.evaluateHandle(() => document.activeElement);
    await element.asElement().press("${keyCode}");
    `;
}

function makeTypeAction(css : string, text : string): string {
    return `await page.waitFor("${css}");
    await page.type("${css}", "${text}");`;
}

function makeChangeAction(css : string, value : string): string {
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

function makeMouseOverAction(css : string): string {
    return `
    await page.waitFor('${css}');
    element = await page.$('${css}');
    await element.hover()`;
}
