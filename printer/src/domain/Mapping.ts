// tslint:disable-next-line: interface-name
export default class Mapping {

    public match: {
        event: string,
        css: string,
        code?: string,
    };

    public output: {
        prefix: string,
        suffix?: string,
    };

    constructor(match : {
        event: string,
        css: string,
        code?: string,
    }, output: {
        prefix: string,
        suffix?: string,
    }) {
        if (match.event === undefined) {
            throw new Error("Mapping match event field required");
        }
        if (match.css === undefined) {
            throw new Error("Mapping match selector field required");
        }
        if (output.prefix === undefined) {
            throw new Error("Mapping output prefix field required");
        }
        this.match = match;
        this.output = output;
    }
}
