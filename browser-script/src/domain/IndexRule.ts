import Action from './Action';
import SimpleRule from './SimpleRule';

export default class IndexRule extends SimpleRule {
    constructor(prefix: string, suffix: string | undefined, event: string, css: string | undefined, xpath: string | undefined,
        code: string | undefined, key: string | undefined, contextURL: string | undefined, contextCSS: string | undefined, contextXPath: string | undefined, description: string) {
        super(prefix, suffix, event, css, xpath, code, key, contextURL, contextCSS, contextXPath, description);
    }

    makeAction(event : Event): Action | undefined {
        const matchingElements = this.findMatchedElements();
        for (let i = 0; i < matchingElements.length; i++) {
            let targetElements = event.composedPath().filter((target):target is HTMLElement | SVGElement => target instanceof HTMLElement || target instanceof SVGElement);
            if (targetElements.length > 0 && matchingElements[i].contains(targetElements[0])) {
                return new Action(this.prefix, i.toString());
            }
        }
    }

    actionToElements(action: Action): (HTMLElement | SVGElement)[] {
        if (action.prefix !== this.prefix) {
            return [];
        }
        if(action.suffix === undefined) {
            return super.actionToElements(action);
        }
        const index = parseInt(action.suffix, 10);
        const elements = this.findMatchedElements();
        // Happens if a previous rules was not using the index suffix
        if (index !== undefined || null) {
            if (elements.length > index) {
                return [elements[index]];
            } else {
                return [];
            }
        } else {
            return elements;
        }
    }
}
