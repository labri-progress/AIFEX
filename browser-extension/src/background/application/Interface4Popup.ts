import CompatibilityCheck from "../domain/CompatibilityCheck";
export default interface Interface4Popup {
    
    makeCompatibilityCheck(serverURL: string): Promise<CompatibilityCheck>;

    connect(serverURL: string, sessionId: string, modelId: string): Promise<"Connected" | "Unauthorized" | "NotFound">;

    startExploration(): Promise<void>;

    stopExploration(): Promise<void>;

    processNewObservation(kind: string , message: string): Promise<void>;

}