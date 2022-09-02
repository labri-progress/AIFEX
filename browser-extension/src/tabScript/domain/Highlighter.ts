import { querySelectorAllDeep } from 'query-selector-shadow-dom';
import BrowserService from './BrowserService';
import HighlighterCanvas from './HighlighterCanvas';
import State from './State';

const WARM_COLOR_THRESHOLD = 0.6;
const MEDIUM_COLOL_THRESHOLD = 0.3;
const COLD_COLOR_THRESHOLD = 0.01;

let oftenColor = "#ff0000";
let sometimesColor = "#FFA500";
let rarelyColor = "#9ACD32";

export default class Highlighter {

    private _browserService : BrowserService;
    private _highlighterCanvas: HighlighterCanvas | undefined;
    private _lastElementWithAIFEXStyle : Set<HTMLElement | SVGElement>;


    constructor(browserService : BrowserService) {
        this._browserService = browserService;
        this._lastElementWithAIFEXStyle = new Set();
        this._browserService.addListenerToChangeInState((oldState, newState) => {
            if (oldState.isRecording === true && newState.isRecording === false) {
                this.hide();
            }
            if (oldState.isRecording === false && newState.isRecording === true) {
                this.show();
            }
            if (newState.actions.length > oldState.actions.length)  {
                this.show();
            }
        })
        this._browserService.getStateFromStorage()
            .then((state: State) => {
                if (state.isRecording) {
                    this.show();
                }
            })
        
    }

    show(): void {
        if (this._highlighterCanvas === undefined) {
            this._highlighterCanvas = new HighlighterCanvas();
        }
        
        console.log("[TabScript] shows elements");
        this._lastElementWithAIFEXStyle.forEach(element => {
            element.removeAttribute("aifex_frequency");
            element.removeAttribute("aifex_style");
        });

        this._browserService.getStateFromStorage()
            .then((state) => {                
                if (state.probabilities) {
                    console.log(state.probabilities);
                    state.probabilities.forEach(([locator, proba]) => {
                        let kindValue = locator.split('$');
                        if (kindValue.length > 1) {
                            let value = kindValue[1];
                            let locatorParameters = value.split('?');
                            if (locatorParameters.length > 1) {
                                let locator = locatorParameters[0];
                                console.log(locator);
                                let elements = querySelectorAllDeep(locator);
                                elements.forEach((element) => {
                                    if (element instanceof HTMLElement || element instanceof SVGElement) {
                                        element.setAttribute("aifex_style", "true");
                                        if (this._highlighterCanvas) {
                                            console.log('canvas');
                                            if (proba > WARM_COLOR_THRESHOLD) {
                                                element.setAttribute("aifex_frequency", "often")
                                                this._highlighterCanvas.highlightElement(element, oftenColor)
                                            } else if (proba > MEDIUM_COLOL_THRESHOLD && element.getAttribute("aifex_frequency") !== "often") {
                                                element.setAttribute("aifex_frequency", "sometimes")
                                                this._highlighterCanvas.highlightElement(element, sometimesColor)
                            
                                            } else if (proba > COLD_COLOR_THRESHOLD && element.getAttribute("aifex_frequency") !== "often" && element.getAttribute("aifex_frequency") !== "sometimes") {
                                                element.setAttribute("aifex_frequency", "rarely")
                                                this._highlighterCanvas.highlightElement(element, rarelyColor)
                                            }
                                        } else {
                                            console.log('no canvas');
                                        }
                                    }
                                })
                            }
                        }
                    })
                }
            })
    }

    hide(): void {
        console.log("[TabScript] does not show any element");
        const domElements = querySelectorAllDeep("[aifex_style]")
        for (const domElement of domElements) {
            domElement.removeAttribute("aifex_frequency");
            domElement.removeAttribute("aifex_style");
        }
    }

}