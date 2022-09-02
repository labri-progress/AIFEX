import Action from "./Action";

export type OverlayType = "rainbow" | "bluesky" | "shadow";

export default class State {
    isRecording: boolean;
    showProbabilityPopup: boolean;
    overlayType: OverlayType;
    actions: Action[];
    probabilities : [[string, number]] | undefined;


    constructor(isActive: boolean, overlayType: OverlayType, showProbabilityPopup: boolean, actions: Action[]) {
        this.isRecording = isActive;
        this.overlayType = overlayType;
        this.showProbabilityPopup = showProbabilityPopup;
        this.actions = actions;
    }
}