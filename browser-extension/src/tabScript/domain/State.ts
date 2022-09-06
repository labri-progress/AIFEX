import Action from "./Action";

export type OverlayType = "rainbow" | "bluesky" | "shadow";

export default class State {
    isRecording: boolean;
    showProbabilityPopup: boolean;
    overlayType: OverlayType;
    actions: Action[];
    probabilities : [[string, number]] | undefined;
    sessionBaseURL : string | undefined;

    constructor() {
        this.isRecording = false;
        this.showProbabilityPopup = false;
        this.overlayType = "rainbow";
        this.probabilities = undefined;
        this.actions = [];
    }
}