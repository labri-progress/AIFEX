import highlighterConfig from "./highlighterConfig.json";

export default class HighlighterCanvas {

    private _canvasMap: Map<number, HTMLCanvasElement>;
    private actionBorderSize = highlighterConfig.actionBorderSize;    
    private elementsToHighlight: Map<HTMLElement, string>;
    
    constructor() {
        this._canvasMap = new Map();
        this._canvasMap.set(0, this.buildCanvas(0))
        this.elementsToHighlight = new Map();
        window.requestAnimationFrame(this.draw.bind(this));
    }

    private buildCanvas(index: number): HTMLCanvasElement {
        let canvas = document.createElement("canvas") as HTMLCanvasElement;
        canvas.id = "aifex_canvas_" + index; 
        canvas.width = document.documentElement.scrollWidth;
        canvas.height = document.documentElement.scrollHeight;
        document.body.appendChild(canvas);
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
                this._canvasMap.set(zIndex, canvas);
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
        let elementIt = element
        while (elementIt !== document.body) {
            let index = window.getComputedStyle(elementIt).zIndex
            console.log(Number.isInteger(index), Number.parseInt(index))

            if (Number.isInteger(index)) {
                return Number.parseInt(index)
            } else {
                if (!element.parentElement) {
                    return 0;
                } else {
                elementIt = element.parentElement
                }
            }
        
        }
        return 0
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