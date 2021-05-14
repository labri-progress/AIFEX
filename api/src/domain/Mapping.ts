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
        url?: string,
        css?: string,
        xpath?: string
    }

    public description?: string;

    constructor(match: {
        event: string,
        css?: string,
        xpath?: string,
        code?: string,
        key?: string,
    }, output: {
        prefix: string,
        suffix?: string,
    }, context?: {
        url?: string,
        css?: string,
        xpath?: string
    }, description?: string) {
        this.match = match;
        this.output = output;
        this.context = context;
        this.description = description;
    }

}
