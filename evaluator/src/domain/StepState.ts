
export enum transitionType {
    epsilon = "EPSILON",
    star = "*",
}

export default class StepState {

    private static idIterator = 0;
    public id: number;

    constructor() {
        this.id = ++StepState.idIterator;
    }

    public toString(): string {
        return this.id.toString();
    }
}
