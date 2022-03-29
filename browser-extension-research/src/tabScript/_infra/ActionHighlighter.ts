import { querySelectorAllDeep } from 'query-selector-shadow-dom';
import {makeCSS} from "./cssStyle";
import ActionsAndElements from '../domain/ActionsAndElements';
import Rule from '../domain/Rule';
import HighlighterCanvas from './HighlighterCanvas';

const WARM_COLOR_THRESHOLD = 0.6;
const MEDIUM_COLOL_THRESHOLD = 0.3;
const COLD_COLOR_THRESHOLD = 0.01;
const displayNeverUsedAction = true;

let oftenColor = "#ff0000";
let sometimesColor = "#FFA500";
let rarelyColor = "#9ACD32";
let neverColor = "#2196F3";
let mappedColor = "#2196F3";

export default class ActionHighlighter {

    private _highlighterCanvas: HighlighterCanvas;
    stylesheetElement: HTMLElement | SVGElement | undefined;
    private _lastElementWithAIFEXStyle : Set<HTMLElement | SVGElement>;

    constructor(highlighterCanvas: HighlighterCanvas) {
        this._lastElementWithAIFEXStyle = new Set();
        this._highlighterCanvas = highlighterCanvas;       
    }

    show(actionAndElements: ActionsAndElements, elementListMatchedByRule: (HTMLElement|SVGElement)[], elementRules: Map<HTMLElement|SVGElement, Rule[]>,): void {
        this._lastElementWithAIFEXStyle.forEach(element => {
            element.removeAttribute("aifex_frequency");
            element.removeAttribute("aifex_style");
        });
        this.attachStyleSheet(document.head);


        for (const domElement of elementListMatchedByRule) {
            domElement.setAttribute("aifex_style", "true");
            this._highlighterCanvas.highlightElement(domElement, mappedColor)

            const rules = elementRules.get(domElement);
            if (rules) {
                domElement.setAttribute("aifex_rules", rules.map(rule => rule.prefix).join(','));
            }
        }

        for (const action of actionAndElements.actionList) {
            for (const htmlElement of action.htmlElementList) {
                const rootNode = htmlElement.getRootNode();
                if (rootNode instanceof HTMLElement || rootNode instanceof SVGElement) {
                    this.attachStyleSheet(rootNode);
                }

                this._lastElementWithAIFEXStyle.add(htmlElement);

                for (const rule of action.ruleList) {
                    htmlElement.setAttribute(`aifex_${rule.prefix}`, "true");
                }
                this._lastElementWithAIFEXStyle.add(htmlElement);
                
                if (action.probability > WARM_COLOR_THRESHOLD) {
                    htmlElement.setAttribute("aifex_frequency", "often")
                    this._highlighterCanvas.highlightElement(htmlElement, oftenColor)
                } else if (action.probability > MEDIUM_COLOL_THRESHOLD && htmlElement.getAttribute("aifex_frequency") !== "often") {
                    htmlElement.setAttribute("aifex_frequency", "sometimes")
                    this._highlighterCanvas.highlightElement(htmlElement, sometimesColor)

                } else if (action.probability > COLD_COLOR_THRESHOLD && 
                            htmlElement.getAttribute("aifex_frequency") !== "often" && 
                            htmlElement.getAttribute("aifex_frequency") !== "sometimes") {
                    htmlElement.setAttribute("aifex_frequency", "rarely")
                    this._highlighterCanvas.highlightElement(htmlElement, rarelyColor)

                } else {
                    if (!htmlElement.hasAttribute("aifex_frequency")) {
                        htmlElement.setAttribute("aifex_frequency", "never")
                        if (displayNeverUsedAction) {
                            this._highlighterCanvas.highlightElement(htmlElement, neverColor)
                        }
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

    private attachStyleSheet(parentNode : HTMLElement | SVGElement): void {
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

            const cssNode = document.createTextNode(makeCSS());
            this.stylesheetElement.appendChild(cssNode);
            parentNode.appendChild(this.stylesheetElement);
        }
    }

}