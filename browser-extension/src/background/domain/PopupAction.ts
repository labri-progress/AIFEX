import Action from "./Action";

export default class PopupAction extends Action {
    descriptions: string[];
    name: string;

    constructor(kind: string, value: string | undefined, descriptions: string[]) {
        super(kind, value);
        this.descriptions = descriptions;
        this.name = super.toString();
    }

}