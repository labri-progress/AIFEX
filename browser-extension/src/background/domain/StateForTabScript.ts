import Exploration from "./Exploration";

export default class StateForTabScript {
    isActive : boolean;
    exploration: Exploration | undefined;

    constructor() {
        this.isActive = false;
    }

}