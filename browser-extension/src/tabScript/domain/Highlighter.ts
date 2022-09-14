import { querySelectorAllDeep } from 'query-selector-shadow-dom';
import { logger } from '../framework/Logger';
import BrowserService from './BrowserService';
import HighlighterCanvas from './HighlighterCanvas';
import PageMutationHandler from './PageMutationHandler';
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
    private _isShowing : boolean;


    constructor(browserService : BrowserService) {
        this._browserService = browserService;
        this._lastElementWithAIFEXStyle = new Set();
        this._isShowing = false;

        this._browserService.addListenerToChangeInState((oldState, newState) => {
            if (newState !== undefined) {
                if (newState.isRecording === false && oldState !== undefined && oldState.isRecording === true) {
                    this.hide();
                } 
                if (newState.isRecording === true) {
                    if (newState.sessionBaseURL !== undefined && document.URL && document.URL.startsWith(newState.sessionBaseURL)) {
                        if (oldState === undefined || oldState.isRecording === false) {
                            this.show(newState);
                        }
                        else if (newState.probabilities) {
                            if (oldState.probabilities) {
                                if (newState.probabilities.length !== oldState.probabilities.length) {
                                    logger.debug(`probabilities  different size`);
                                    this.show(newState);
                                } else {
                                    for (let index = 0; index < newState.probabilities.length; index++) {
                                        if (newState.probabilities[index][0] !== oldState.probabilities[index][0] || newState.probabilities[index][1] !== oldState.probabilities[index][1]) {
                                            logger.debug(`not same probabilities`);
                                            this.show(newState);
                                        }
                                    }
                                    logger.debug('same proba');
                                    logger.debug(`${newState.probabilities}`);
                                }
                            } else {
                                this.show(newState);
                            }
                        } else {
                            logger.debug('newState has no proba');
                        }
                    }
                }
            }  
        });

        window.addEventListener("DOMContentLoaded",(_event) => {
            let pmh = new PageMutationHandler((() => {
                if (this._isShowing) {
                    this._browserService.getStateFromStorage()
                    .then((state: State) => {
                        if (state.isRecording && state.sessionBaseURL && document.URL) {
                            if (document.URL.startsWith(state.sessionBaseURL)) {
                                this.show(state);
                            }
                        }
                    })
                    .catch(e => {
                        logger.debug('error while getting the state');
                    })
                }
            }).bind(this));
            pmh.init()
        });      

    }

    show(state: State): void {
        this._isShowing = true;
        if (this._highlighterCanvas === undefined) {
            this._highlighterCanvas = new HighlighterCanvas();
        }
        
        logger.debug("shows elements");
        this._lastElementWithAIFEXStyle.forEach(element => {
            element.removeAttribute("aifex_frequency");
            element.removeAttribute("aifex_style");
        });

        if (state.probabilities) {
            state.probabilities.forEach(([locator, proba]) => {
                let kindValue = locator.split('$');
                if (kindValue.length > 1) {
                    let locator = kindValue[1];
                    logger.debug(`${locator}`);
                    let elements = querySelectorAllDeep(locator);
                    logger.debug(`there are ${elements.length} elements`);
                    elements.forEach((element) => {
                        if (element instanceof HTMLElement || element instanceof SVGElement) {
                            element.setAttribute("aifex_style", "true");
                            if (this._highlighterCanvas) {
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
                                logger.debug(`there is no highlighterCanvas`);
                            }
                        } 
                    })   
                }
            })
            if (this._highlighterCanvas) {
                this._highlighterCanvas.show();
            }
            
        }
    }

    hide(): void {
        logger.debug("does not show any element");
        this._isShowing = false;
        const domElements = querySelectorAllDeep("[aifex_style]")
        for (const domElement of domElements) {
            domElement.removeAttribute("aifex_frequency");
            domElement.removeAttribute("aifex_style");
        }
        if (this._highlighterCanvas) {
            this._highlighterCanvas.hide();
        }
        
    }

}