import CompatibilityCheck from "../domain/CompatibilityCheck";
import { PopupPageKind } from "../domain/PopupPageKind";
import StateForPopup from "../domain/StateForPopup";

export default interface Interface4Popup {

    changePopupPageKind(popupPageKind: PopupPageKind): void;

    toggleDetachPopup(): Promise<void>;

    getStateForPopup(): StateForPopup;

    makeCompatibilityCheck(serverURL: string): Promise<CompatibilityCheck>;

    linkServer(serverURL: string) : Promise<"LinkedToServer">;

    unlinkServer() : void;

    signin(username: string, password: string): Promise<"SignedIn" | "Unauthorized">;

    connect(serverURL: string, sessionId: string, modelId: string): Promise<"Connected" | "Unauthorized" | "NotFound">;

    disconnect(): Promise<void>;

    reloadWebsite(): Promise<void>;

    drawAttention(): Promise<void>;

    startExploration(): Promise<void>;

    stopExploration(): Promise<void>;

    restartExploration(): Promise<void>;

    removeExploration(): Promise<void>;

    changeTesterName(newName: string): Promise<void>;

    addCommentToExploration(kind: string , message: string): void;

    takeScreenShot(): Promise<void>;

    setRecordMedia(recordMedia: boolean): Promise<void>;

    setShouldCreateNewWindowsOnConnect(shouldCreateNewWindowsOnConnect: boolean): void;

    setShouldCloseWindowOnDisconnect(shouldCloseWindowOnDisconnect: boolean): void;

    upComment(type: string, value: string): void;

}