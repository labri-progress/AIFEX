import ContextMapper from "./ContextMapper";
import Rule from "./Rule";

export default class URLContextMapper extends ContextMapper {
    constructor(context : string) {
        super(context);
    }

    buildElementToRuleMap() : Map<HTMLElement|SVGElement, Rule[]> {
        if (this._context && document.URL.startsWith(this._context)) {
            return this.buildElementToRuleMapForSelectors();
        } else {
            return new Map();
        }
    }
}