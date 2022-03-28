export default class ObservationDistribution {

    private _observation: string;
    private _distributions : {
        observationOccurence: number,
        contextOccurece: number,
        context: string[]
    }[];

    constructor(observation: string, distributions : {
        observationOccurence: number,
        contextOccurece: number,
        context: string[]
    }[]) {
        this._observation = observation;
        this._distributions = distributions;
    }

    get observation() : string {
        return this._observation;
    }

    get distributions() : {
        observationOccurence: number,
        contextOccurece: number,
        context: string[]
    }[] {
        return this._distributions;
    }

}