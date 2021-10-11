import ContextMapper from "./ContextMapper";
import Rule from "./Rule";
import URLContextMapper from "./URLContextMapper";
import XPathContextMapper from "./XPathContextMapper";
import ContextLessMapper from "./ContextLessMapper";
import CSSContextMapper from "./CSSContextMapper";
import {logger} from "../framework/Logger";

export default class RuleMapper {
    private _cssContext2ContextMapper : Map<string, ContextMapper>;
    private _xpathContext2ContextMapper : Map<string, ContextMapper>;
    private _urlContext2ContextMapper : Map<string, ContextMapper>;
    private _contextLessMapper : ContextLessMapper;
    private _prefix2Rules : Map<string, Rule[]>;
    private _eventInRules : string[];
    public rules: Rule[];

    constructor(rules : Rule[]) {
        logger.debug(`rules: ${rules.length}`);
        this._cssContext2ContextMapper = new Map();
        this._xpathContext2ContextMapper = new Map();
        this._urlContext2ContextMapper = new Map();
        this._contextLessMapper = new ContextLessMapper();
        this._prefix2Rules = new Map();
        this._eventInRules = [];
        this.rules = rules;

        rules.forEach(rule => {
            let rules4Prefix = this._prefix2Rules.get(rule.prefix);
            if (! rules4Prefix) {
                rules4Prefix = [];
                this._prefix2Rules.set(rule.prefix,rules4Prefix);
            }
            rules4Prefix.push(rule);

            if (!this._eventInRules.includes(rule.event)) {
                this._eventInRules.push(rule.event);
            }

            if (rule.contextCSS) {
                logger.debug(rule.contextCSS);
                let contextMapper4CssContext = this._cssContext2ContextMapper.get(rule.contextCSS);
                if (!contextMapper4CssContext) {
                    contextMapper4CssContext = new CSSContextMapper(rule.contextCSS)
                    this._cssContext2ContextMapper.set(rule.contextCSS, contextMapper4CssContext);
                }
                contextMapper4CssContext.add(rule);
            } else if (rule.contextXPath) {
                logger.debug(rule.contextXPath);
                let contextMapper4XpathContext = this._xpathContext2ContextMapper.get(rule.contextXPath);
                if (!contextMapper4XpathContext) {
                    contextMapper4XpathContext = new XPathContextMapper(rule.contextXPath);
                    this._xpathContext2ContextMapper.set(rule.contextXPath, contextMapper4XpathContext);
                }
                contextMapper4XpathContext.add(rule);
            } else if (rule.contextURL) {
                let contexMapper4URLContext = this._urlContext2ContextMapper.get(rule.contextURL);
                if (!contexMapper4URLContext) {
                    contexMapper4URLContext = new URLContextMapper(rule.contextURL);
                    this._urlContext2ContextMapper.set(rule.contextURL, contexMapper4URLContext);
                }
                contexMapper4URLContext.add(rule);
            } else {
                this._contextLessMapper.add(rule);
            }
        })

        logger.debug(`css context: ${this._cssContext2ContextMapper.size}`);
        logger.debug(`xpath context: ${this._xpathContext2ContextMapper.size}`);
        logger.debug(`url context: ${this._urlContext2ContextMapper.size}`);
    }

    getIsLoaded(): boolean {
        return this._prefix2Rules.size > 0;
    }

    getRuleListByPrefix(prefix : string) : Rule[] {
        let rules4prefis = this._prefix2Rules.get(prefix);
        if (rules4prefis) {
            return rules4prefis;
        } else {
            return [];
        }
    }

    get eventInRules(): string[] {
        return this._eventInRules;
    }

    buildElementToRuleMap(): Map<HTMLElement|SVGElement, Rule[]> {
        const result : Map<HTMLElement|SVGElement, Rule[]> = new Map();
        for (const mapper of this._urlContext2ContextMapper.values()) {
            for (const [element, rules] of mapper.buildElementToRuleMap()) {
                let rules4element = result.get(element);
                if (!rules4element) {
                    rules4element = []
                    result.set(element,rules4element);
                }
                rules4element.push(...rules);
                logger.debug(`${rules4element.length} rules added to element ${element} with URL as a context`);
            }
        }
        for (const mapper of this._cssContext2ContextMapper.values()) {
            for (const [element, rules] of mapper.buildElementToRuleMap()) {
                let rules4element = result.get(element);
                if (!rules4element) {
                    rules4element = []
                    result.set(element,rules4element);
                }
                rules4element.push(...rules);
                logger.debug(`${rules4element.length} rules added to element ${element} with CSS as a context`);
            }
        }
        for (const mapper of this._xpathContext2ContextMapper.values()) {
            for (const [element, rules] of mapper.buildElementToRuleMap()) {
                let rules4element = result.get(element);
                if (!rules4element) {
                    rules4element = []
                    result.set(element,rules4element);
                }
                rules4element.push(...rules);
                logger.debug(`${rules4element.length} rules added to element ${element} with URL as a context`);
            }
        }
        for (const [element, rules] of this._contextLessMapper.buildElementToRuleMap()) {
            let rules4element = result.get(element);
            if (!rules4element) {
                rules4element = []
                result.set(element,rules4element);
            }
            rules4element.push(...rules);
            logger.debug(`${rules4element.length} rules added to element ${element} with nothing as a context`);
        }
        return result;
    }

}