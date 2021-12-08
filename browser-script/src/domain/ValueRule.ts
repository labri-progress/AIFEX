import Action from './Action';
import SimpleRule from './SimpleRule';

export default class ValueRule extends SimpleRule {
    constructor(prefix: string, suffix: string | undefined, event: string, css: string | undefined, xpath: string | undefined,
        code: string | undefined, key: string | undefined, contextURL: string | undefined, contextCSS: string | undefined, contextXPath: string | undefined, description: string) {
        super(prefix, suffix, event, css, xpath, code, key, contextURL, contextCSS, contextXPath, description);
    }

    makeAction(event : Event): Action | undefined {
        let target = event.target;
        if (target) {
            if (target instanceof HTMLInputElement) {
                return new Action(this.prefix, target.value);
            } else if (target instanceof HTMLSelectElement) {
                return new Action(this.prefix, "svg");
            }
        }
    }

    actionToElements(action: Action): (HTMLElement|SVGElement)[] {
        if (action.prefix !== this.prefix) {
            return [];
        }
        if (action.suffix === undefined) {
            return super.actionToElements(action);
        }
        const elements = this.findMatchedElements();
        return elements;
    }
}
