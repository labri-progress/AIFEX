import Action from "./Action";

export type OverlayType = "rainbow" | "bluesky" | "shadow";

export default class State {
    isRecording: boolean;
    showProbabilityPopup: boolean;
    overlayType: OverlayType;
    actions: Action[];
    probabilities : [[string, number]] | undefined;
    sessionBaseURL : string | undefined;

    constructor(obj: any) {
        this.isRecording = obj.isRecording || false;
        this.showProbabilityPopup = false;
        this.overlayType = "rainbow";
        this.actions = obj.actions || [];;
        this.probabilities = obj.probabilities;
        this.sessionBaseURL = obj.sessionBaseURL;
    }
}