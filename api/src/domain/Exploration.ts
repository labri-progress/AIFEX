import Interaction from "./Interaction";

export default class Exploration {
    readonly tester: string;
    readonly isStopped: boolean;
    readonly explorationNumber: number;
    readonly interactionList: Interaction[];
    readonly startDate : Date;
    readonly stopDate : Date | undefined;

    constructor(tester: string, explorationNumber: number, interactionList: Interaction[], startDate?:Date, stopDate?:Date) {
        this.tester = tester;
        if (startDate) {
            this.startDate = startDate;
        } else {
            this.startDate = new Date();
        }
        if (stopDate) {
            this.stopDate = stopDate;
        } else {
            this.startDate = new Date();
        }

        this.explorationNumber = explorationNumber;
        this.isStopped = false;
        this.interactionList = interactionList;
    }

}
