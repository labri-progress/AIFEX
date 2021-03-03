import Action from './Action';
import Rule from './Rule';

export default class SimpleRule extends Rule {
    constructor(prefix: string, suffix: string | undefined, event: string, css: string | undefined, xpath: string | undefined,
        code: string | undefined, key: string | undefined, contextURL: string | undefined, contextCSS: string | undefined, contextXPath: string | undefined, description: string) {
        super(prefix, suffix, event, css, xpath, code, key, contextURL, contextCSS, contextXPath, description);
    }

    makeAction(event : Event): Action | undefined {
        return new Action(this.prefix);
    }

    actionToElements(action: Action): HTMLElement[] {
        if (action.prefix !== this.prefix) {
            return [];
        }
        const elements = this.findMatchedElements();
        return elements;
    }
}
