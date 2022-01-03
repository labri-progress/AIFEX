import Action from './Action';
import Rule from './Rule';
import getCssSelector from 'css-selector-generator';
import {logger} from "../framework/Logger";

export default class CSSSelectorRule extends Rule {
    constructor(prefix: string, suffix: string | undefined, event: string, css: string | undefined, xpath: string | undefined,
        code: string | undefined, key: string | undefined, contextURL: string | undefined, contextCSS: string | undefined, contextXPath: string | undefined, description: string) {
        super(prefix, suffix, event, css, xpath, code, key, contextURL, contextCSS, contextXPath, description);
    }

    makeAction(event : Event): Action | undefined {
        if (event.target) {
            let suffix;
            try {
                suffix = getCssSelector(event.target, {selectors: ['id', 'tag']});
            } catch (e) {
                logger.error(`exception`,new Error('css exception'));
            }
            return new Action(this.prefix, suffix);
        }
    }

    actionToElements(action: Action): (HTMLElement|SVGElement)[] {
        if (action.prefix !== this.prefix) {
            return [];
        }

        if (action.suffix) {
            const elements : (HTMLElement|SVGElement)[] = [];
            const parentElements = this.findMatchedElements();
            document.querySelectorAll(action.suffix).forEach( (element) => {
                if (parentElements.some((parent) => parent.contains(element))) {
                    if (element instanceof HTMLElement || element instanceof SVGElement) {
                        elements.push(element);
                    }
                }
            });
            return elements;
        } else {
            return [];
        }
    }
}
