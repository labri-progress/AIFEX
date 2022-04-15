import CompatibilityCheck from "../domain/CompatibilityCheck";
import { PopupPageKind } from "../domain/PopupPageKind";
import StateForPopup from "../domain/StateForPopup";

export default interface Interface4Popup {
    
    changePopupPageKind(popupPageKind: PopupPageKind): void;

    getStateForPopup(): StateForPopup;

    makeCompatibilityCheck(serverURL: string): Promise<CompatibilityCheck>;

    connect(serverURL: string, sessionId: string, modelId: string): Promise<"Connected" | "Unauthorized" | "NotFound">;

    disconnect(): void;

    startExploration(): Promise<void>;

    stopExploration(): Promise<void>;

    changeTesterName(newName: string): Promise<void>;

    setTakeAsScreenshotByAction(takeAScreenshotByAction : boolean): void;

	submitConfig(testerName: string): void;

}