import Rule from "./Rule";
import Action from "./Action";
import RuleMapper from "./RuleMapper";
import IndexRule from "./IndexRule";
import InnerTextRule from "./InnerTextRule";
import ValueRule from "./ValueRule";
import SimpleRule from "./SimpleRule";
import CSSSelectorRule from "./CSSSelectorRule";
import AttributeValueRule from "./AttributeValueRule";
import CSSSelectorWithValueRule from "./CSSSelectorWithValueRule";
import RobulaSelectorRule from "./RobulaSelectorRule";
import ExperimentSelectorRule from "./ExperimentSelectorRule";

export default class RuleService {
    elementRules: Map<HTMLElement|SVGElement, Rule[]>;
    private _ruleMapper : RuleMapper;

    constructor() {
        this.elementRules = new Map();
        this._ruleMapper = new RuleMapper([]);
    }

    get elementListMatchedByRule(): (HTMLElement|SVGElement)[] {
        return Array.from(this.elementRules.keys())
    }

    getEventsToHandle(): string[] {
        return this._ruleMapper.eventInRules;
    }

    loadRules(rules : Rule[]):void {
        this._ruleMapper = new RuleMapper(rules);
    }

    mapRulesToElements():void {
        this.elementRules = this._ruleMapper.buildElementToRuleMap();
    }

    getMatchingRule(event : Event ): Rule | undefined {
        let elements = event.composedPath().filter((target): target is HTMLElement | SVGElement => target instanceof HTMLElement || target instanceof SVGElement);
        for (const element of elements) {
            const rules = this.elementRules.get(element);
            if (rules !== undefined) {
                const matchingRule = rules.find((rule) => rule.match(event))
                if (matchingRule) {
                    return matchingRule;
                }
            }
        }
    }

    getRuleListByAction(action: Action): Rule[] {
        return this._ruleMapper.getRuleListByPrefix(action.prefix);
    }

    getHTMLElementsMatchedByAction(action: Action): (HTMLElement|SVGElement)[] {
        const elements : Set<HTMLElement|SVGElement> = new Set();
        action.ruleList.forEach(rule => {
            const elementListForRule = rule.actionToElements(action);
            elementListForRule.forEach(element => elements.add(element));
        });
        return [...elements.values()];
    }

    createRule(data : {
        output : {
            prefix : string,
            suffix? : string,
        },
        match : {
            event : string,
            css? : string,
            xpath? : string,
            code? : string,
            key? : string,
            attributeName?: string
        },
        context? : {
            url? : string,
            css? : string,
            xpath? : string
        },
        description : string
    }) : Rule {
        switch (data.output.suffix) {
            case "innerText":
                return new InnerTextRule(data.output.prefix,data.output?.suffix, data.match.event, data.match?.css, data.match?.xpath, data.match?.code, data.match?.key, data?.context?.url, data?.context?.css, data?.context?.xpath, data.description);
            case "index":
                return new IndexRule(data.output.prefix,data.output.suffix, data.match.event, data.match?.css, data.match?.xpath, data.match?.code, data.match?.key, data?.context?.url, data?.context?.css, data?.context?.xpath, data.description);
            case "value":
                return new ValueRule(data.output.prefix,data.output.suffix, data.match.event, data.match?.css, data.match?.xpath, data.match?.code, data.match?.key, data?.context?.url, data?.context?.css, data?.context?.xpath, data.description);
            case "cssSelector":
                return new CSSSelectorRule(data.output.prefix,data.output.suffix, data.match.event, data.match?.css, data.match?.xpath, data.match?.code, data.match?.key, data?.context?.url, data?.context?.css, data?.context?.xpath, data.description);
            case "cssSelectorWithValue":
                return new CSSSelectorWithValueRule(data.output.prefix,data.output.suffix, data.match.event, data.match?.css, data.match?.xpath, data.match?.code, data.match?.key, data?.context?.url, data?.context?.css, data?.context?.xpath, data.description);
            case "robulaSelector":
                return new RobulaSelectorRule(data.output.prefix,data.output.suffix, data.match.event, data.match?.css, data.match?.xpath, data.match?.code, data.match?.key, data?.context?.url, data?.context?.css, data?.context?.xpath, data.description);
            case "experimentSelector":
                return new ExperimentSelectorRule(data.output.prefix,data.output.suffix, data.match.event, data.match?.css, data.match?.xpath, data.match?.code, data.match?.key, data?.context?.url, data?.context?.css, data?.context?.xpath, data.description);
            case "attributeValue":
                if (data.match.attributeName === undefined) {
                    return new SimpleRule(data.output.prefix,data.output.suffix, data.match.event, data.match?.css, data.match?.xpath, data.match?.code, data.match?.key, data?.context?.url, data?.context?.css, data?.context?.xpath, data.description);
                } else {
                    return new AttributeValueRule(data.output.prefix,data.output.suffix, data.match.event, data.match?.css, data.match?.xpath, data.match?.code, data.match?.key, data?.context?.url, data?.context?.css, data?.context?.xpath, data.description, data.match.attributeName);
                }
            default:
                return new SimpleRule(data.output.prefix,data.output.suffix, data.match.event, data.match?.css, data.match?.xpath, data.match?.code, data.match?.key, data?.context?.url, data?.context?.css, data?.context?.xpath, data.description);
        }

    }


}