import ContextMapper from "./ContextMapper";
import Rule from "./Rule";

export default class CSSContextMapper extends ContextMapper {

    constructor(context : string) {
        super(context);
    }

    buildElementToRuleMap() : Map<HTMLElement|SVGElement, Rule[]> {
        if (this._context) {
            const cssQueryResult = document.querySelector(this._context);
            if (cssQueryResult && cssQueryResult instanceof HTMLElement) {
                return this.buildElementToRuleMapForSelectors(cssQueryResult);
            } else {
                return new Map();
            }
        } else {
            return new Map();
        }
        
    }

}