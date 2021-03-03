import Action from "./Action";
import Interaction from "./Interaction";

export default class SequenceEvaluation {

    public enteringInteractionList: Interaction[];
    public continuingActionList: Action[];
    public finishingInteractionList: Interaction[];
    public isAccepted: boolean;

    constructor(
        stepEnteringInteractionList: Action[]= [], 
        stepUpdatingActionList: Action[]= [], 
        stepFinishingInteractionList: Action[]= [], 
        isAccepted: boolean = false) {

        this.enteringInteractionList = stepEnteringInteractionList;
        this.continuingActionList = stepUpdatingActionList;
        this.finishingInteractionList = stepFinishingInteractionList;
        this.isAccepted = isAccepted;
    }

}
