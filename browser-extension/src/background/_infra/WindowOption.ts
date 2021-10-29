export default class WindowOption {
    readonly url : string | string[] | undefined;
    readonly left : number | undefined;
    readonly top : number | undefined;
    readonly incognito : boolean | undefined;
    readonly height : number | undefined;
    readonly width : number | undefined;
    readonly type : any;

    constructor(options : {
        url? : string | string[],
        left? : number,
        top? : number,
        incognito? : boolean,
        height? : number,
        width? : number,
        type? : any,
    }) {
        if (options.url) {
            this.url = options.url;
        }
        if (options.left) {
            this.left = options.left;
        }
        if (options.top) {
            this.top = options.top;
        }
        if (options.incognito) {
            this.incognito = options.incognito;
        }
        if (options.height) {
            this.height = options.height;
        }
        if (options.width) {
            this.width = options.width;
        }
        if (options.type) {
            this.type = options.type;
        }
    }
}