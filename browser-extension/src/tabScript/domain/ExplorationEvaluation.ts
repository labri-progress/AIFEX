import Action from "./Action";

export default class ExplorationEvaluation {

    public isAccepted: boolean;
    public enteringInteractionList: Action[];
    public continuingActionList: Action[];
    public finishingInteractionList: Action[];

    constructor(isAccepted: boolean, stepEnteringInteractionList: Action[]= [], stepUpdatingActionList: Action[]= [], stepFinishingInteractionList: Action[]= []) {
        this.isAccepted = isAccepted;
        this.enteringInteractionList = stepEnteringInteractionList;
        this.continuingActionList = stepUpdatingActionList;
        this.finishingInteractionList = stepFinishingInteractionList;
    }

}
