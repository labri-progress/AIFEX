import {PopupPageKind} from './PopupPageKind';
import Exploration from "./Exploration";
import Screenshot from "./Screenshot";

export default class State {
    public connectedToSession : boolean;
    public serverURL : string | undefined;
    public sessionId : string | undefined;
    public sessionBaseURL : string | undefined;
    public testerName : string | undefined;
    public takeAScreenshotByAction : boolean;
    public recordActionByAction : boolean;
    public explorationNumber : number | undefined;
    public explorationLength : number | undefined;
    public popupPageKind : PopupPageKind;
    public isRecording : boolean;;

    constructor() {
        this.connectedToSession = false;
        this.isRecording = false;
        this.takeAScreenshotByAction = true;
        this.recordActionByAction = true;
        this.popupPageKind = PopupPageKind.Home;
    }

}