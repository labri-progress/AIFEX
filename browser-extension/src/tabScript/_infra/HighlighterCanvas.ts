import highlighterConfig from "./highlighterConfig.json";

export default class HighlighterCanvas {

    private _canvas: HTMLCanvasElement;
    private actionBorderSize = highlighterConfig.actionBorderSize;    
    private elementsToHighlight: Map<Element, string>;
    
    constructor() {
        this._canvas = this.buildCanvas()
        this.elementsToHighlight = new Map();
        window.requestAnimationFrame(this.draw.bind(this));
    }

    private buildCanvas(): HTMLCanvasElement {
        let canvas: HTMLCanvasElement = document.getElementById("aifex_canvas") as HTMLCanvasElement;
        if (canvas) {
            return canvas as HTMLCanvasElement;
        } else {
            canvas = document.createElement("canvas") as HTMLCanvasElement;
            canvas.id = "aifex_canvas"; 
            canvas.width = document.documentElement.scrollWidth
            canvas.height = document.documentElement.scrollHeight
            document.body.appendChild(canvas);

            return canvas;
        }
    }

    public highlightElement(element: Element, color: string) {
        console.log(element)
        this.elementsToHighlight.set(element, color);
    }

    public clearHighlight() {
        this.elementsToHighlight = new Map();
    }

    private draw() {
        this.clear();
        this._canvas = this.buildCanvas();
        let scrollX = window.scrollX;
        let scrollY = window.scrollY;
        for (const [element, color] of this.elementsToHighlight) {
            const boundedBox = element.getBoundingClientRect();
            const ctx: CanvasRenderingContext2D | null = this._canvas.getContext('2d');
            if (ctx === null) {
                return;
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

    private clear() {
        const context = this._canvas.getContext('2d');
        if (context === null) {
            return
        }
        context.clearRect(0, 0, this._canvas.width, this._canvas.height);
    }

}