import Action from "./Action";
import Exploration from "./Exploration";
import { OverlayType } from "./Session";
import WebSite from "./Website";

export default class StateForTabScript {
    isRecording : boolean;
    displayUserView : boolean;
    webSite : WebSite | undefined;
    popupCommentPosition : {x:string, y:string} | undefined;
    commentsUp: string[] | undefined;
    overlayType: OverlayType;
    exploration: Exploration | undefined;
    showProbabilityPopup : boolean;

    constructor() {
        this.isRecording = false;
        this.displayUserView = false;
        this.overlayType = "rainbow";
        this.showProbabilityPopup = true;
    }

}