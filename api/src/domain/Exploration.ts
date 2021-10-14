import Action from "./Action";

export default class Exploration {
    readonly tester: string;
    readonly isStopped: boolean;
    readonly explorationNumber: number;
    readonly actionList: Action[];
    readonly startDate : Date;
    readonly stopDate : Date | undefined;

    constructor(tester: string, explorationNumber: number, actionList: Action[], startDate?:Date, stopDate?:Date) {
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
        this.actionList = actionList;
    }

}
