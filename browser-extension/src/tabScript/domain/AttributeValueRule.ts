import Action from './Action';
import SimpleRule from './SimpleRule';

export default class AttributeValueRule extends SimpleRule {

    public attributeName: string;

    constructor(prefix: string, 
        suffix: string | undefined, 
        event: string, css: string | undefined, 
        xpath: string | undefined,
        code: string | undefined, 
        key: string | undefined, 
        contextURL: string | undefined, 
        contextCSS: string | undefined, 
        contextXPath: string | undefined, 
        description: string,
        attributeName: string,
        ) {
        super(prefix, suffix, event, css, xpath, code, key, contextURL, contextCSS, contextXPath, description);
        this.attributeName = attributeName
    }

    makeAction(event : Event): Action | undefined {
        const element = this.findActionMappedTarget(event);

        if (element !== undefined) {
            let attributeValue = element.getAttribute(this.attributeName)
            if (attributeValue) {
                return new Action(this.prefix, attributeValue);
            }
        }
        return new Action(this.prefix);
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
                    return domElement.getAttribute(this.attributeName) === suffix;
                } else {
                    return false;
                }
            });
        }
    }
}
