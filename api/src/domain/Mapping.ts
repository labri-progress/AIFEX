// tslint:disable-next-line: interface-name
export default class Mapping {

    readonly match: {
        event: string,
        css?: string,
        xpath?: string,
        code?: string,
        key?: string,
    };

    readonly output: {
        prefix: string,
        suffix?: string,
    };

    readonly context?: {
        url?: string,
        css?: string,
        xpath?: string
    }

    readonly description?: string;

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
