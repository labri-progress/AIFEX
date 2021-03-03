export default class Stimulus {
    public readonly value: string;

    constructor(value: string) {
        if (value === null || value === undefined) {
            throw new Error("Cannot create Stimulus with no value");
        }
        this.value = value;
    }

}
