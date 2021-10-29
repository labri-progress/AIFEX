import Screenshot from "./Screenshot";

export default interface ScreenshotRepository {

    addScreenshot(screenshot:Screenshot): Promise<string>;
    
    findScreenshot(sessionId: string, explorationNumber: number, interactionIndex: number): Promise<string | undefined>;
    
    findScreenshotBySession(sessionId: string): Promise<Array<{explorationNumber:number, interactionIndex:number }> | undefined>;

}
