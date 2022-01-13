import Action from './Action';
import Rule from './Rule';
import { RobulaPlus } from "px-robula-plus";
import {logger} from "../framework/Logger";

export default class RobulaSelectorRule extends Rule {
    private _robulaPlus;

    constructor(prefix: string, suffix: string | undefined, event: string, css: string | undefined, xpath: string | undefined,
        code: string | undefined, key: string | undefined, contextURL: string | undefined, contextCSS: string | undefined, contextXPath: string | undefined, description: string) {
        super(prefix, suffix, event, css, xpath, code, key, contextURL, contextCSS, contextXPath, description);
        this._robulaPlus = new RobulaPlus();
    }

    makeAction(event : Event): Action | undefined {
        if (event.target && event.target instanceof Element) {
            let suffix;
            try {
                suffix = this._robulaPlus.getRobustXPath(event.target, document);
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
            let element = this._robulaPlus.getElementByXPath(action.suffix, document);

            if (parentElements.some((parent) => parent.contains(element))) {
                if (element instanceof HTMLElement || element instanceof SVGElement) {
                    elements.push(element);
                }
            }

            return elements;
        } else {
            return [];
        }
    }
}
