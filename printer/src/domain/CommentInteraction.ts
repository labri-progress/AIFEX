import Observation from "./Observation";
import Interaction from "./Interaction";

// Value Object
export default class ObservationInteraction extends Interaction {
    public readonly observation: Observation;

    constructor(index: number, observation: Observation) {
        super(index);
        this.observation = observation;
    }

    public toString(): string {
        if (this.observation.value) {
            return `${this.observation.kind}$${this.observation.value}`;
        } else {
            return this.observation.kind;
        }
    }
}
