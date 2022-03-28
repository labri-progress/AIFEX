// Value Object
export default class Observation {
    public readonly kind: string;
    public readonly value: string;

    constructor(kind: string, value: string) {
        this.kind = kind;
        this.value = value;
    }

}
