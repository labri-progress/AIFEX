import { querySelectorAllDeep } from 'query-selector-shadow-dom';
import cssStyle from "./cssStyle";
import ActionsAndElements from '../domain/ActionsAndElements';
import {logger} from "../framework/Logger";
import Rule from '../domain/Rule';

const WARM_COLOR_THRESHOLD = 0.6;
const MEDIUM_COLOL_THRESHOLD = 0.3;
const COLD_COLOR_THRESHOLD = 0.01;

export default class ActionProbabilityView {

    stylesheetElement: HTMLElement | undefined;
    private _lastElementWithAIFEXStyle : Set<HTMLElement>;

    constructor() {
        this._lastElementWithAIFEXStyle = new Set();
        
        const DEBUG_MODE = process.env.NODE_ENV === 'debug';
        if (DEBUG_MODE) {
            console.log(`DEBUG_MODE, add mouseover listener`);
            document.addEventListener("mouseover", (ev: MouseEvent) => {
                const composedPath = ev.composedPath();
                composedPath.forEach((target, index) => {
                    if (target instanceof HTMLElement) {
                        const rulesPrefix = target.getAttribute("aifex_rules")
                        if (rulesPrefix) {
                            console.log(`The ${index} parent matches the following rule(s) :  ${rulesPrefix}`);
                            console.log(target);
                        } else {
                            console.log(`The ${index} parent has no rule`);
                        }
                    } 
                })
            })
        } 
    }

    show(actionAndElements: ActionsAndElements, elementListMatchedByRule: HTMLElement[], elementRules: Map<HTMLElement, Rule[]>,): void {
        logger.debug(`ActionProbabilityView show (elements : ${elementListMatchedByRule.length})`);
        this._lastElementWithAIFEXStyle.forEach(element => {
            element.removeAttribute("aifex_frequency");
            element.removeAttribute("aifex_style");
        })
        this.attachStyleSheet(document.head);

        for (const domElement of elementListMatchedByRule) {
            domElement.setAttribute("aifex_style", "true");
            const rules = elementRules.get(domElement);
            if (rules) {
                domElement.setAttribute("aifex_rules", rules.map(rule => rule.prefix).join(','));
            }
        }

        for (const action of actionAndElements.actionList) {
            for (const htmlElement of action.htmlElementList) {
                const rootNode = htmlElement.getRootNode();
                if (rootNode instanceof HTMLElement) {
                    this.attachStyleSheet(rootNode);
                }
                this._lastElementWithAIFEXStyle.add(htmlElement);

                for (const rule of action.ruleList) {
                    htmlElement.setAttribute(`aifex_${rule.prefix}`, "true");
                }


                this._lastElementWithAIFEXStyle.add(htmlElement);
                

                htmlElement.setAttribute("aifex_style", "true");
                if (action.probability > WARM_COLOR_THRESHOLD) {
                    htmlElement.setAttribute("aifex_frequency", "often")
                } else if (action.probability > MEDIUM_COLOL_THRESHOLD && htmlElement.getAttribute("aifex_frequency") !== "often") {
                    htmlElement.setAttribute("aifex_frequency", "sometimes")
                } else if (action.probability > COLD_COLOR_THRESHOLD && 
                            htmlElement.getAttribute("aifex_frequency") !== "often" && 
                            htmlElement.getAttribute("aifex_frequency") !== "sometimes") {
                    htmlElement.setAttribute("aifex_frequency", "rarely")
                } else {
                    if (!htmlElement.hasAttribute("aifex_frequency")) {
                        htmlElement.setAttribute("aifex_frequency", "never")
                    }
                }
            }
        }

    }

    hide(): void {
        const domElements = querySelectorAllDeep("[aifex_style]")
        for (const domElement of domElements) {
            domElement.removeAttribute("aifex_frequency");
            domElement.removeAttribute("aifex_style");
        }
    }

    private attachStyleSheet(parentNode : HTMLElement): void {
        const nodeChilds: Element[] = Array.from(parentNode.children);
        if (nodeChilds.some(node => node.hasAttribute("aifex_stylesheet"))) {
            return;
        }
        if (this.stylesheetElement) {
            parentNode.appendChild(this.stylesheetElement.cloneNode(true));
        } else {
            this.stylesheetElement = document.createElement("style");
            this.stylesheetElement.setAttribute("type", "text/css");
            this.stylesheetElement.setAttribute("aifex_stylesheet", "true");

            const cssNode = document.createTextNode(cssStyle);
            this.stylesheetElement.appendChild(cssNode);
            parentNode.appendChild(this.stylesheetElement);
        }
    }

}