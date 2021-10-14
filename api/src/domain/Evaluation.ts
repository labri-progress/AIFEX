import Action from "./Action";

export default class Evaluation {

    public nextActionList: Action[];
    public isAccepted: boolean;

    constructor(
        nextActionList: Action[]= [], 
        isAccepted: boolean = false) {

        this.nextActionList = nextActionList;
        this.isAccepted = isAccepted;
    }

}
