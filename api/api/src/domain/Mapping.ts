// tslint:disable-next-line: interface-name
export default class Mapping {

    public match: {
        event: string,
        css?: string,
        xpath?: string,
        code?: string,
        key?: string,
    };

    public output: {
        prefix: string,
        suffix?: string,
    };

    public context?: {
        url?:string,
        css?: string,
        xpath?: string
    }

    constructor(match, output, context?) {
        this.match = match;
        this.output = output;
        this.context = context;
    }

}
