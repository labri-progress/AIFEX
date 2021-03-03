import ContextMapper from "./ContextMapper";
import Rule from "./Rule";

export default class ContextLessMapper extends ContextMapper {
    constructor() {
        super(undefined);
    }

    buildElementToRuleMap() : Map<HTMLElement, Rule[]> {
        return this.buildElementToRuleMapForSelectors();
    }
}