import Action from './Action';
import {PopupPageKind} from './PopupPageKind';

export default class State {
    public connectedToSession : boolean;
    public serverURL : string | undefined;
    public sessionId : string | undefined;
    public modelId : string | undefined;
    public sessionBaseURL : string | undefined;
    public sessionDescription : string | undefined;
    public testerName : string | undefined;
    public takeAScreenshotByAction : boolean;
    public recordActionByAction : boolean;
    public explorationNumber : number | undefined;
    public explorationLength : number | undefined;
    public popupPageKind : PopupPageKind;
    public isRecording : boolean;
    public actions : Action[];
    public probabilities : [[string, number]] | undefined;

    constructor() {
        this.connectedToSession = false;
        this.isRecording = false;
        this.takeAScreenshotByAction = true;
        this.recordActionByAction = true;
        this.popupPageKind = PopupPageKind.Home;
        this.actions = [];
    }

}