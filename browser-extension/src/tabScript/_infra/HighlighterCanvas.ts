import highlighterConfig from "./highlighterConfig.json";

export default class HighlighterCanvas {

    private _canvasMap: Map<number, HTMLCanvasElement>;
    private actionBorderSize = highlighterConfig.actionBorderSize;    
    private elementsToHighlight: Map<HTMLElement, string>;
    private elementToZindex: Map<HTMLElement, number>;
    
    constructor() {
        this._canvasMap = new Map();
        this._canvasMap.set(1, this.buildCanvas(1))
        this.elementsToHighlight = new Map();
        this.elementToZindex = new Map();
        window.requestAnimationFrame(this.draw.bind(this));
    }

    private buildCanvas(index: number): HTMLCanvasElement {
        let canvas = document.createElement("canvas") as HTMLCanvasElement;
        canvas.id = "aifex_canvas_" + index; 
        canvas.classList.add("aifex_canvas")
        canvas.style.zIndex = index.toString();
        canvas.width = document.documentElement.scrollWidth;
        canvas.height = document.documentElement.scrollHeight;
        document.body.appendChild(canvas);
        this._canvasMap.set(index, canvas);
        return canvas;
    }

    public highlightElement(element: HTMLElement, color: string) {
        this.elementsToHighlight.set(element, color);
    }

    public clearHighlight() {
        this.elementsToHighlight = new Map();
    }

    private draw() {
        this.clear();
        let scrollX = window.scrollX;
        let scrollY = window.scrollY;
        for (const [element, color] of this.elementsToHighlight) {
            const zIndex = this.getZIndex(element);
            let canvas = this._canvasMap.get(zIndex);
            if (canvas === undefined) {
                canvas = this.buildCanvas(zIndex);
            }
            const boundedBox = element.getBoundingClientRect();
            const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
            if (ctx === null) {
                continue;
            }
            ctx.fillStyle = color;
            ctx.fillRect(scrollX + boundedBox.x- this.actionBorderSize, 
                        scrollY + boundedBox.y-this.actionBorderSize, 
                        boundedBox.width+2*this.actionBorderSize, 
                        boundedBox.height+2*this.actionBorderSize)
            ctx.clearRect(scrollX + boundedBox.x, scrollY + boundedBox.y, boundedBox.width, boundedBox.height)
        }
        window.requestAnimationFrame(this.draw.bind(this));
    }

    private getZIndex(element: HTMLElement): number {
        let elementIt: HTMLElement | null = element;
        let index = this.elementToZindex.get(element);
        if (index !== undefined) {
            return index;
        } else {
            while (elementIt !== null && elementIt !== undefined) {
                let index = window.getComputedStyle(elementIt).zIndex;
                if (index !== "auto") {
                    let indexInt = Number.parseInt(index)
                    if (indexInt !== NaN && indexInt !== undefined) {
                        this.elementToZindex.set(element, indexInt)
                        return indexInt
                    }
                }
                elementIt = elementIt.parentElement
            }
        }
        this.elementToZindex.set(element, 1)
        return 1
    }

    private clear() {
        for (const canvas of this._canvasMap.values()) {
            const context = canvas.getContext('2d');
            if (context === null) {
                return
            }
            context.clearRect(0, 0, canvas.width, canvas.height);
        }
        
    }

}