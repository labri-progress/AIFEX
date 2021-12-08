import Rule from "./Rule";
import {logger} from "../framework/Logger";

export default abstract class ContextMapper {
    protected _context : string | undefined;
    protected _cssSelector2Rules : Map<string, Rule[]>;
    protected _xpathSelector2Rules : Map<string, Rule[]>;

    constructor(context : string | undefined) {
        this._context = context;
        this._cssSelector2Rules = new Map();
        this._xpathSelector2Rules = new Map();
    }

    add(rule : Rule): void {
        if (rule.contextCSS !== this._context && rule.contextURL !== this._context && rule.contextXPath !== this._context) {
            throw new Error('cannot add rule with a different context ');
        }
        if (rule.css) {
            if (!this._cssSelector2Rules.has(rule.css)) {
                this._cssSelector2Rules.set(rule.css, []);
            }
            let rules4Selector = this._cssSelector2Rules.get(rule.css);
            if (rules4Selector) {
                rules4Selector.push(rule);
            }
        }
        if (rule.xpath) {
            if (!this._xpathSelector2Rules.has(rule.xpath)) {
                this._xpathSelector2Rules.set(rule.xpath, []);
            }
            let rules4Selector = this._xpathSelector2Rules.get(rule.xpath);
            if (rules4Selector) {
                rules4Selector.push(rule);
            }
        }
    }

    abstract buildElementToRuleMap() : Map<HTMLElement|SVGElement, Rule[]>;

    protected buildElementToRuleMapForSelectors(context? : HTMLElement|SVGElement) : Map<HTMLElement|SVGElement, Rule[]> {
        const elementToRules : Map<HTMLElement|SVGElement, Rule[]> = new Map();
        for (const [selector, rules] of this._cssSelector2Rules) {
            let querySelector : NodeListOf<HTMLElement|SVGElement>;
            if (context) {
                querySelector = context.querySelectorAll(selector);
            } else {
                querySelector = document.querySelectorAll(selector);
            }
            querySelector.forEach(element => {
                let rules4Element = elementToRules.get(element);
                if (!rules4Element) {
                    rules4Element = [];
                    elementToRules.set(element, rules4Element);
                }
                rules4Element.push(...rules);
            })
        }
        for (const [selector, rules] of this._xpathSelector2Rules) {
            let queryXpath;
            let queryXpathResult;

            try {
                if (context) {
                    queryXpath = document.evaluate(selector, context, null, XPathResult.ANY_TYPE, null);
                } else {
                    queryXpath = document.evaluate(selector, document, null, XPathResult.ANY_TYPE, null);
                }
            } catch (e) {
                logger.error('XPath Error:',new Error("e"));
            }

            if (queryXpath) {
                queryXpathResult = queryXpath.iterateNext();

                while (queryXpathResult) {
                    if (queryXpathResult instanceof HTMLElement || queryXpathResult instanceof SVGElement) {
                        let noContext = ! context;
                        let resultInContext = context && context.contains(queryXpathResult);
                        if (noContext || resultInContext) {
                            let rules4Element = elementToRules.get(queryXpathResult);
                            if (!rules4Element) {
                                rules4Element = [];
                                elementToRules.set(queryXpathResult, rules4Element);
                            }
                            rules4Element.push(...rules);
                        }
                    }
                    queryXpathResult = queryXpath.iterateNext();
                }
            }
        }
        return elementToRules;
    }
}