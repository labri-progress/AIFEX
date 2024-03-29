import Action from './Action';
import Observation from './Observation';
import {PopupPageKind} from './PopupPageKind';

export type OverlayType = "rainbow" | "bluesky" | "shadow";

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
    public actionsAndObservations : Array<Action | Observation>;
    public probabilities : [[string, number]] | undefined;
    public overlayType: OverlayType;

    constructor(obj: any) {
        this.connectedToSession = obj.connectedToSession || false;
        this.serverURL = obj.serverURL;
        this.sessionId = obj.sessionId;
        this.modelId = obj.modelId;
        this.sessionBaseURL = obj.sessionBaseURL;
        this.sessionDescription = obj.sessionDescription;
        this.testerName = obj.testerName;
        this.takeAScreenshotByAction = obj.takeAScreenshotByAction || false;
        this.recordActionByAction  = true;
        this.explorationNumber = obj.explorationNumber;
        this.explorationLength = obj.explorationLength;
        this.popupPageKind = obj.popupPageKind || PopupPageKind.Home;
        this.isRecording = obj.isRecording === true ? true : false;
        this.actionsAndObservations = obj.actionsAndObservations === undefined ? [] : obj.actionsAndObservations;
        this.probabilities = undefined;
        this.overlayType = "rainbow";
    }

}