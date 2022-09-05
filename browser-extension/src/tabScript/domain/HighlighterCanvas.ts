export default class HighlighterCanvas {

    private _canvasMap: Map<number, HTMLCanvasElement>;
    private actionBorderSize = 5; 
    private elementsToHighlight: Map<HTMLElement| SVGElement, string>;
    private elementsToHighlightAnimated: Set<HTMLElement| SVGElement>;
    private elementToZindex: Map<HTMLElement| SVGElement, number>;
    private animationLoop : number;
    private isStopped: boolean;
    private lastTime: number;

    constructor() {
        this._canvasMap = new Map();
        this.buildCanvas(1)
        this.elementsToHighlight = new Map();
        this.elementToZindex = new Map();
        this.elementsToHighlightAnimated = new Set<HTMLElement | SVGElement>();
        this.animationLoop = 0;
        this.isStopped = false;
        this.lastTime = 0;
        window.addEventListener("resize", this.resizeCanvas.bind(this))
        window.addEventListener("scroll", this.moveCanvas.bind(this))
        window.requestAnimationFrame(this.draw.bind(this));
    }

    private resizeCanvas() {
        for (const canvas of this._canvasMap.values()) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    }

    private moveCanvas() {
        for (const canvas of this._canvasMap.values()) {
            canvas.style.top = window.scrollY.toString()+ "px";
            canvas.style.left = window.scrollX.toString()+ "px";
        }
    }

    private buildCanvas(index: number): void {
        if (document.body) {
            let canvas = document.createElement("canvas") as HTMLCanvasElement;
            canvas.id = "aifex_canvas_" + index; 
            canvas.style.zIndex = index.toString();
            canvas.style.top = window.scrollY.toString() + "px";
            canvas.style.left = window.scrollX.toString()+ "px"
            canvas.style.pointerEvents = "none";
            canvas.style.position = "absolute"
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            document.body.appendChild(canvas);
            this._canvasMap.set(index, canvas);
        }
    }

    public highlightElement(element: HTMLElement | SVGElement, color: string) {
        this.elementsToHighlight.set(element, color);
    }

    public animateElement(element: HTMLElement | SVGElement) {
        this.elementsToHighlightAnimated.add(element);
    }

    public clearAnimatedElements() {
        this.elementsToHighlightAnimated = new Set();
    }

    public reset() {
        this.clear();
        this.elementsToHighlight = new Map();
        this.elementToZindex = new Map();
        this.elementsToHighlightAnimated = new Set<HTMLElement | SVGElement>();
    }

    public show() {
        this.isStopped = false;
        window.requestAnimationFrame(this.draw.bind(this));
    }

    public hide() {
        this.clear();
        this.isStopped = true;
    }

    private draw(time: number) {
        if (time - this.lastTime < 20) {
            window.requestAnimationFrame(this.draw.bind(this));
            return;
        }
        this.lastTime = time;
        this.clear();
        if (this.isStopped) return;
        this.drawBorders()
        this.drawAnimatedBorders("#FF00FF")
        this.animationLoop = (this.animationLoop+1) % 100;
        window.requestAnimationFrame(this.draw.bind(this));
    }

    private drawBorders() {
        for (const [element, color] of this.elementsToHighlight) {
            let boundedBox = element.getBoundingClientRect()

            if (!this.isInViewport(boundedBox)) {
                continue;
            }
            const zIndex = this.getZIndex(element);
            if (!this._canvasMap.has(zIndex)) {
                this.buildCanvas(zIndex);
            }
            let canvas = this._canvasMap.get(zIndex);
            if (canvas !== undefined) {
                element.setAttribute("aifex_canvas_used", zIndex.toString());
                const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
                if (ctx === null) {
                    continue;
                }

                ctx.beginPath();
                ctx.strokeStyle = color;
                ctx.lineWidth = this.actionBorderSize;
                ctx.rect(boundedBox.x- this.actionBorderSize/2, 
                    boundedBox.y - this.actionBorderSize/2, 
                    boundedBox.width + this.actionBorderSize/2,
                    boundedBox.height + this.actionBorderSize/2);
                ctx.stroke();
            }
        }
    }

    private drawAnimatedBorders(color: string) {

        for (const element of this.elementsToHighlightAnimated) {
            const boundedBox = element.getBoundingClientRect();
            if (! this.isInViewport(boundedBox)) {
                continue;
            }
            const zIndex = this.getZIndex(element);
            if (!this._canvasMap.has(zIndex)) {
                this.buildCanvas(zIndex);
            }
            let canvas = this._canvasMap.get(zIndex);
            if (canvas !== undefined) {
                const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
                if (ctx === null) {
                    continue;
                }
            
                let posx: number, posy: number;
                let size = 8;
                let totalSize = boundedBox.width * 2 + boundedBox.height * 2;
                let position = totalSize * this.animationLoop / 100;
                if (position < boundedBox.width) {
                    posx = boundedBox.x + position;
                    posy = boundedBox.y;
                }
                else if (position < boundedBox.width + boundedBox.height) {
                    let offset = position - boundedBox.width
                    posx = boundedBox.x + boundedBox.width;
                    posy = boundedBox.y + offset;
                }
                else if (position < boundedBox.width * 2 + boundedBox.height) {
                    let offset = position - boundedBox.width - boundedBox.height;
                    posx = boundedBox.x + boundedBox.width - offset;
                    posy = boundedBox.y + boundedBox.height;
                } else {
                    let offset = position - boundedBox.width*2 - boundedBox.height
                    posx = boundedBox.x;
                    posy = boundedBox.y + boundedBox.height - offset;
                }
                ctx.beginPath();
                ctx.arc(posx, posy, size, 0, 2 * Math.PI, false);

                ctx.restore(); // restore original state
    
                ctx.fillStyle = color;
                ctx.fill();
                ctx.lineWidth = 2;
                ctx.strokeStyle = "black";
                ctx.stroke();
            }
        }
    }

    private getZIndex(element: HTMLElement| SVGElement): number {
        let elementIt: HTMLElement| SVGElement | null = element;
        let index = this.elementToZindex.get(element);
        if (index !== undefined) {
            return index;
        } else {
            let maxIndex: number = 0;
            while (elementIt !== null && elementIt !== undefined) {
                let index = window.getComputedStyle(elementIt).zIndex;
                if (index !== "auto") {
                    let indexInt = Number.parseInt(index)
                    if (indexInt !== NaN && indexInt !== undefined && indexInt > maxIndex) {
                        this.elementToZindex.set(element, indexInt+1)
                        maxIndex = indexInt;
                    }
                }
                elementIt = elementIt.parentElement
            }
            this.elementToZindex.set(element, maxIndex+1)
            return maxIndex
        }
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

    private isInViewport(rect: DOMRect) {
        if (rect.width === 0 || rect.height === 0) {
            return false;
        }
        return (
            rect.bottom >= 0 &&
            rect.right >= 0 &&
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.left <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

}