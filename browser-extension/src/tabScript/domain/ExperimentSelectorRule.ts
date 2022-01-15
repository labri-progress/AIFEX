import Action from './Action';
import Rule from './Rule';
import { RobulaPlus } from "px-robula-plus";
import getCssSelector from 'css-selector-generator';
import {logger} from "../framework/Logger";

export default class ExperimentSelectorRule extends Rule {
    private _robulaPlus;

    constructor(prefix: string, suffix: string | undefined, event: string, css: string | undefined, xpath: string | undefined,
        code: string | undefined, key: string | undefined, contextURL: string | undefined, contextCSS: string | undefined, contextXPath: string | undefined, description: string) {
        super(prefix, suffix, event, css, xpath, code, key, contextURL, contextCSS, contextXPath, description);
        this._robulaPlus = new RobulaPlus();
    }

    makeAction(event : Event): Action | undefined {
        if (event.target && event.target instanceof Element) {
            let suffix = [];
            try {
                //suffix.push(this._robulaPlus.getRobustXPath(event.target, document));
                //suffix.push(getCssSelector(event.target, {selectors: [CssSelectorType.id, CssSelectorType.class]}));
                //suffix.push(getCssSelector(event.target, {selectors: [CssSelectorType.id, CssSelectorType.class, CssSelectorType.tag]}));
                suffix.push(getCssSelector(event.target, {
                    selectors: ["id", 
                        "class", 
                        "tag", 
                        "attribute"
                    ], 
                    blacklist: [
                        /.*data.*/i, 
                        /.*aifex.*/i, 
                        /.*over.*/i,
                        /.*auto.*/i,
                        /.*value.*/i,
                        /.*checked.*/i,
                        '[placeholder]',
                        /.*href.*/i,
                        /.*onclick.*/i,
                        /.*onload.*/i,
                        /.*onkeyup.*/i,
                        /.*width.*/i,
                        /.*height.*/i,
                        /.*style.*/i,
                        /.*size.*/i,
                        /.*maxlength.*/i
                    ],
                    combineBetweenSelectors: true,
                    maxCandidates: 100
                }));
                
            } catch (e) {
                logger.error(`exception`,new Error('css exception'));
            }
            return new Action(this.prefix, suffix.join('<-->'));
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
