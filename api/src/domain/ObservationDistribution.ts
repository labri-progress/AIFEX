export default class ObservationDistribution {

    //sequence of actions
    readonly context: string[];

    // Number of time a observation has been added in this context
    readonly observationOccurence: number;

    // Number of time the context has appeard
    readonly contextOccurence: number;


    constructor(context: string[], observationOccurence: number, contextOccurence: number) {
        this.context = context;
        this.observationOccurence = observationOccurence;
        this.contextOccurence = contextOccurence;
    }

}
