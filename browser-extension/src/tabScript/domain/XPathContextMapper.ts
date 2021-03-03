import ContextMapper from "./ContextMapper";
import Rule from "./Rule";

export default class XPathContextMapper extends ContextMapper {
    constructor(context : string) {
        super(context);
    }

    buildElementToRuleMap() : Map<HTMLElement, Rule[]> {
        if (this._context) {

            const xpathQueryResult = document.evaluate(this._context, document, null, XPathResult.ANY_TYPE, null);
            const context = xpathQueryResult.iterateNext();
            if (context instanceof HTMLElement) {
                return this.buildElementToRuleMapForSelectors();
            } else {
                return new Map();
            }
        } else {
            return new Map();
        }   
    }
}