import Observation from "./Observation";
import Interaction from "./Interaction";

export default class ObersationInteraction extends Interaction {
    public readonly observation: Observation;

    constructor(index: number, observation: Observation, date?: Date) {
        super(index, date);
        this.observation = observation;
    }
}
