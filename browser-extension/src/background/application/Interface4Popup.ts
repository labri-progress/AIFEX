import CompatibilityCheck from "../domain/CompatibilityCheck";
import { PopupPageKind } from "../domain/PopupPageKind";
import StateForPopup from "../domain/StateForPopup";

export default interface Interface4Popup {
    
    makeCompatibilityCheck(serverURL: string): Promise<CompatibilityCheck>;

    connect(serverURL: string, sessionId: string, modelId: string): Promise<"Connected" | "Unauthorized" | "NotFound">;

    startExploration(): Promise<void>;

    stopExploration(): Promise<void>;

    addObservationToExploration(kind: string , message: string): void;

}