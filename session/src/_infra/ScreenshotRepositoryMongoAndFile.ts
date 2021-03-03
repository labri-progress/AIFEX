
import { writeFileSync } from "fs";
import Screenshot from "../domain/Screenshot";
import ScreenshotRepository from "../domain/ScreenshotRepository";
import ScreenshotSchema from "./ScreenshotSchema";

export default class ScreenshotRepositoryMongoAndFile implements ScreenshotRepository {

    public addScreenshot(screenshot: Screenshot): Promise<string> {
        // console.log('addScreenshot in repository');
        return ScreenshotSchema.create({
                sessionId: screenshot.sessionId,
                explorationNumber: screenshot.explorationNumber,
                interactionIndex: screenshot.interactionIndex,
            })
            .then( () => {
                // console.log('stored in repository');
                const fileName = `/app/screenshot/${screenshot.sessionId}_${screenshot.explorationNumber}_${screenshot.interactionIndex}.jpg`;
                const base64Image = screenshot.image.split(";base64,").pop();
                if (base64Image  === undefined) {
                    return Promise.reject("no base 64 image");
                } else {
                    writeFileSync(fileName, base64Image, "base64");
                    // console.log('file stored:',fileName);
                    return fileName;
                }
            })
            .then( (fileName) => {
                return fileName;
            });
    }

    public findScreenshot(sessionId: string, explorationNumber: number, interactionIndex: number): Promise<string | undefined> {
        return ScreenshotSchema.findOne({sessionId, explorationNumber, interactionIndex}).exec()
            .then((screenshotData) => {
                if (screenshotData === undefined || screenshotData === null) {
                   return undefined;
                } else {
                    // console.log(screenshotData);
                    return screenshotData.sessionId + screenshotData.explorationNumber + screenshotData.interactionIndex;
                }
            });
    }

    public findScreenshotBySession(sessionId: string): Promise<{explorationNumber: number, interactionIndex: number }[]> {
        return ScreenshotSchema.find({sessionId}).exec()
            .then((screenShotDataList) => {
                return screenShotDataList.map((screenShotData) => {
                    return {
                        explorationNumber: screenShotData.explorationNumber,
                        interactionIndex: screenShotData.interactionIndex,
                    };
                });
            });

    }

}
