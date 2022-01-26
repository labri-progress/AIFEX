import Action from './Action';
import Rule from './Rule';
import getCssSelector from 'css-selector-generator';
import {logger} from "../framework/Logger";

export default class ExperimentRule extends Rule {
    constructor(prefix: string, suffix: string | undefined, event: string, css: string | undefined, xpath: string | undefined,
        code: string | undefined, key: string | undefined, contextURL: string | undefined, contextCSS: string | undefined, contextXPath: string | undefined, description: string) {
        super(prefix, suffix, event, css, xpath, code, key, contextURL, contextCSS, contextXPath, description);
    }

    makeAction(event : Event): Action | undefined {
        if (event.target) {
            if (event.target instanceof HTMLElement || event.target instanceof SVGElement) { 
                let suffix;
                try {
                    suffix = getCssSelector(event.target, {
                        selectors: [
                            "id", 
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
                            /.*src.*/i,
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
                    });
                } catch (e) {
                    logger.error(`exception`,new Error('css exception'));
                }

                const rect = event.target.getBoundingClientRect();
                if (rect) {
                    suffix +=`?left=${rect.left}&top=${rect.top}&right=${rect.right}&bottom=${rect.bottom}&width=${rect.width}&height=${rect.height}&screenwidth=${window.innerWidth}&screenheight=${window.innerHeight}`;
                }
                return new Action(this.prefix, suffix);
            }
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