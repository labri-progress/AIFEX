import ObservationDistribution from "./ObservationDistribution";
import Action from "./Action";

export default class Observation {

    public type: string;
    public note: string;
    public distributionList: ObservationDistribution[];

    constructor(type: string, note: string) {
        this.type = type;
        this.note = note;
        this.distributionList = [];
    }

    addDistribution(noteOccurence: number, contextOccurence: number, context: Action[]) : void{
        const distribution = new ObservationDistribution(context, contextOccurence, noteOccurence);
        this.distributionList.push(distribution)
    }

    public toString(): string {
        return `${this.type}: ${this.note}`;
    }

    static parseObservation(observationText: string): Observation {
        const parts = observationText.split("$");
        if (parts.length === 2) {
            return new Observation(parts[0], parts[1]);
        } else {
            throw new Error("Failed to parse observation : " + observationText);
        }
    }

}