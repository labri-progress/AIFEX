import Action from "./Action";

export default class ExplorationEvaluation {
    public isAccepted: boolean;
    public nextActionList: Action[];

    constructor(isAccepted: boolean, nextActionList: Action[]) {
        this.isAccepted = isAccepted;
        this.nextActionList = nextActionList;
       
    }

}
