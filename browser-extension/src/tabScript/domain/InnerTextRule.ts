import Action from './Action';
import SimpleRule from './SimpleRule';

export default class InnerTextRule extends SimpleRule {
    constructor(prefix: string, suffix: string | undefined, event: string, css: string | undefined, xpath: string | undefined,
        code: string | undefined, key: string | undefined, contextURL: string | undefined, contextCSS: string | undefined, contextXPath: string | undefined, description: string) {
        super(prefix, suffix, event, css, xpath, code, key, contextURL, contextCSS, contextXPath, description);
    }

    makeAction(event: any): Action | undefined {
        const element = this.findActionMappedTarget(event);
        if (element) {
            return new Action(this.prefix, element.innerText.trim());
        }
    }

    actionToElements(action: Action): HTMLElement[] {
        if (action.prefix !== this.prefix) {
            return [];
        }
        if (action.suffix === undefined) {
            return super.actionToElements(action);
        } else {
            let suffix = action.suffix;
            const elements = this.findMatchedElements();
            return elements.filter(domElement => {
                if (domElement instanceof HTMLElement) {
                    return domElement.innerText.trim() === suffix.trim()
                } else {
                    return false;
                }
            });
        }
    }
}