import Action from "./Action";

export default class ActionsAndElements {

    public actionList: Action[];
    public elementToActionListMap: Map<HTMLElement|SVGElement, Action[]>;

    constructor(actionList: Action[], elementToActionMap: Map<HTMLElement|SVGElement, Action[]>) {
        this.actionList = actionList;
        this.elementToActionListMap = elementToActionMap;
    }

}