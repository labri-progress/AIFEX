import Exploration from "./Exploration";
import { OverlayType } from "./Session";
import WebSite from "./Website";

export default class StateForTabScript {
    isActive : boolean;
    displayUserView : boolean;
    webSite : WebSite | undefined;
    popupObservationPosition : {x:string, y:string} | undefined;
    observationsUp: string[] | undefined;
    overlayType: OverlayType;
    exploration: Exploration | undefined;
    showProbabilityPopup : boolean;

    constructor() {
        this.isActive = false;
        this.displayUserView = false;
        this.overlayType = "rainbow";
        this.showProbabilityPopup = true;
    }

}