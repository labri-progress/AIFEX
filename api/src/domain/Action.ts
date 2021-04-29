// Value Object
export default class Action {

    public readonly kind: string;
    public readonly value: string | undefined;

    constructor(kind: string, value?: string ) {
        this.kind = kind;
        this.value = value;
    }
}
