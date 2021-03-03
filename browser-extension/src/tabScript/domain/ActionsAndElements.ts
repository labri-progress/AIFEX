import Action from "./Action";

export default class ActionsAndElements {

    public actionList: Action[];
    public elementToActionListMap: Map<HTMLElement, Action[]>;

    constructor(actionList: Action[], elementToActionMap: Map<HTMLElement, Action[]>) {
        this.actionList = actionList;
        this.elementToActionListMap = elementToActionMap;
    }

}