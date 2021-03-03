// Value Object
export default abstract class Interaction {
    public readonly index: number;
    public readonly when: Date | undefined;

    constructor(index: number) {
        this.index = index;
    }
    public abstract toString(): string;

}
