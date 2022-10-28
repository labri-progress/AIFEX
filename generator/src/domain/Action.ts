// Value Object
export default class Action {

    public readonly kind: string;
    public readonly value: string | undefined;

    constructor(kind: string, value?: string ) {
        this.kind = kind;
        this.value = value;
    }

    get key(): string {
        let key = this.kind;
        if (this.value !== undefined) {
            key += '$' + this.value.split('?href')[0];
        }
        return key;
    }

    isEqualTo(other: Action): boolean {
        return this.key === other.key;
    }
}
