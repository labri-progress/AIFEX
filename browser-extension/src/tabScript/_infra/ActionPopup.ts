import { querySelectorAllDeep } from 'query-selector-shadow-dom';
import Action from "../domain/Action";
import ActionState from '../domain/ActionsAndElements';
import configuration from "../../../configuration.json";

const PROBABILITY_POPUP = "AIFEX_probabilityPopup";
const MAX_DISPLAYED_LINES = 9;

export default class ActionsPopup {
    hoveredElement: HTMLElement | undefined;
    private checkHoverElementsExistsInterval: NodeJS.Timeout | undefined;
    private probabilityPopup: HTMLElement | undefined;

    constructor() {
    }

    show(actionState: ActionState): void {
        if (!configuration.displayProbabilityPopup) {
            return;
        }
        if (!this.probabilityPopup) {
            this.probabilityPopup = document.createElement("div");
            this.probabilityPopup.setAttribute("id", PROBABILITY_POPUP);
            document.body.appendChild(this.probabilityPopup);
            this.probabilityPopup.style.position = "absolute";
        }
        if (this.hoveredElement) {
            if (actionState.elementToActionListMap.has(this.hoveredElement)) {
                let content = actionState.elementToActionListMap.get(this.hoveredElement);
                if (content) {
                    this.updatePopupContent(content);
                }
            }
        }
        this.attachMouseMoveHandler();
        this.attachMouseEnterHandlers(actionState.elementToActionListMap);
        if(!this.checkHoverElementsExistsInterval) {
            const ONE_SECOND = 1000;
            this.checkHoverElementsExistsInterval = setInterval(this.checkHoveredElementExists.bind(this), ONE_SECOND)
        }
    }

    hide(): void {
        if (this.checkHoverElementsExistsInterval) {
            clearInterval(this.checkHoverElementsExistsInterval);
        }
        this.hidePopup()
    }

    private updatePopupContent(actionList: Action[]): void {
        if (this.probabilityPopup) {
            while(this.probabilityPopup.hasChildNodes()) {
                if (this.probabilityPopup.firstChild) {
                    this.probabilityPopup.firstChild.remove();
                }
            }
            if (actionList.length === 0) {
                return;
            }
            for (const action of actionList.slice(0, MAX_DISPLAYED_LINES)) {
                const probability = (action.probability * 100).toFixed(2);
    
                const pElement = document.createElement("p");
                pElement.classList.add("popupItem")
                const actionSpan = document.createElement("span");
                actionSpan.classList.add("popupAction");
                actionSpan.textContent = `${action.toString()}: `;
    
                const probabilitySpan = document.createElement("span");
                probabilitySpan.classList.add("popupProbability");
                probabilitySpan.textContent = `${probability}%`;
    
                pElement.appendChild(actionSpan);
                pElement.appendChild(probabilitySpan);
    
                this.probabilityPopup.appendChild(pElement)
            }
        }
    }

    private attachMouseEnterHandlers(elementActionListMap: Map<HTMLElement, Action[]>): void {
        for (const element of elementActionListMap.keys()) {

            const showHandler = (event : Event) => {
                if (this.probabilityPopup && event.target instanceof HTMLElement) {
                    this.hoveredElement = event.target;
                    if (elementActionListMap.has(this.hoveredElement)) {
                        this.probabilityPopup.style.visibility = "visible";
                        const content = elementActionListMap.get(this.hoveredElement);
                        if (content) {
                            this.updatePopupContent(content);
                        }
                    }
                }
            };

            const hideHandler = () => {
                this.hoveredElement = undefined;
                if (this.probabilityPopup) {
                    this.probabilityPopup.style.visibility = "hidden";
                }
            }

            element.removeEventListener("mouseenter", showHandler);
            element.removeEventListener("mouseleave" , hideHandler);

            element.addEventListener("mouseenter", showHandler);
            element.addEventListener("mouseleave" , hideHandler);
        }

    }

    private attachMouseMoveHandler(): void {
        document.body.addEventListener('mousemove', (e) => {
            if (this.probabilityPopup) {
                let x = e.pageX;
                const bounding = document.body.getBoundingClientRect();
                if (e.pageX + this.probabilityPopup.offsetWidth > bounding.right) {
                    x = bounding.right - this.probabilityPopup.offsetWidth;
                }
                this.probabilityPopup.style.left = x + 'px';
                this.probabilityPopup.style.top = e.pageY + 'px';
            }
        });
    }

    private hidePopup(): void {
        const probabilityPopup = document.getElementById(PROBABILITY_POPUP);
        if (probabilityPopup) {
            probabilityPopup.style.visibility = "hidden";
        }
    }

    private checkHoveredElementExists(): void{
        if (this.hoveredElement) {
            const hoveredElements = querySelectorAllDeep(':hover');
            for (const hovered of hoveredElements) {
                if (hovered === this.hoveredElement) {
                    return;
                }
            }
        }
        this.hoveredElement = undefined;
        if (this.probabilityPopup) {
            this.probabilityPopup.style.visibility = "hidden";
        }
    }

}