import { querySelectorAllDeep } from 'query-selector-shadow-dom';
import Action from "./Action";

export default abstract class Rule {

    event: string;
    css: string | undefined;
    xpath: string | undefined;
    prefix: string;
    suffix: string | undefined;
    key: string | undefined;
    code: string | undefined;
    contextURL: string | undefined;
    contextCSS: string | undefined;
    contextXPath: string | undefined;
    description: string;

    constructor(prefix: string, suffix: string | undefined, event: string, css: string | undefined, xpath: string | undefined,
        code: string | undefined, key: string | undefined, contextURL: string | undefined, contextCSS: string | undefined, contextXPath: string | undefined, description: string) {

        this.event = event;
        this.code = code;
        this.css = css;
        this.xpath = xpath;
        this.prefix = prefix;
        this.suffix = suffix;
        this.key = key;
        this.contextURL = contextURL;
        this.contextCSS = contextCSS;
        this.contextXPath = contextXPath;
        this.description = description;
    }

    match(event : Event) : boolean {
        if (event.type !== this.event) {
            return false;
        }

        if (event instanceof KeyboardEvent) {
            if (this.event === "keyup" || this.event === "keydown" || this.event === "keypress") {
                if (this.code && event.code !== this.code) {
                    return false
                }
                if (this.key && event.key !== this.key) {
                    return false
                }
            }
            return true;
        } else {
            return true;
        }
        
    }


    abstract makeAction(event : Event): Action | undefined;

    abstract actionToElements(action: Action): (HTMLElement | SVGElement)[] ;

    findActionMappedTarget(event: Event): HTMLElement | SVGElement | undefined {
        const target = event.composedPath()[0];
        if (target instanceof HTMLElement || target instanceof SVGElement) {
            if (target.hasAttribute("aifex_style")) {
                return target;
            } else {
                let closest = target.closest("[aifex_style]");
                if (closest && (closest instanceof HTMLElement || closest instanceof SVGElement)) {
                    return closest;
                }
            }
        }
    }

    findMatchedElements() : (HTMLElement|SVGElement)[]{
        let context;

        if (this.contextXPath) {
            try {
                const result = document.evaluate(this.contextXPath, document, null, XPathResult.ANY_TYPE, null);
                context = result.iterateNext();
            } catch (e) {
                console.error(e);
            }
            if (!context) {
                return [];
            }
        }
        if (this.contextCSS) {
            context = document.querySelector(this.contextCSS);
            if (!context) {
                return [];
            }
        }

        let elements = [];
        if (this.xpath) {
            try {
                let result;
                if (context) {
                    result = document.evaluate(this.xpath, context, null, XPathResult.ANY_TYPE, null);
                } else {
                    result = document.evaluate(this.xpath, document, null, XPathResult.ANY_TYPE, null);
                }
                let node = result.iterateNext();
                while (node) {
                    elements.push(node);
                    node = result.iterateNext();
                }
            } catch (e) {
                console.error(e);
            }
        } 
        if (this.css) {
            if (context) {
                elements = querySelectorAllDeep(this.css, context);
            } else {
                elements = querySelectorAllDeep(this.css)
            }
        }
        return elements.filter((element : Node): element is HTMLElement | SVGElement => element instanceof HTMLElement || element instanceof SVGElement);
    }

}