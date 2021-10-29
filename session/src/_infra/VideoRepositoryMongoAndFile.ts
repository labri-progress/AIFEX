
import { readFileSync, writeFileSync } from "fs";
import Video from "../domain/Video";
import VideoRepository from "../domain/VideoRepository";
import VideoSchema from "./VideoSchema";

export default class VideoRepositoryMongoAndFile implements VideoRepository {

    public addVideo(video: Video): Promise<void> {
        // console.log('addVideo in repository');
        return VideoSchema.create({
                sessionId: video.sessionId,
                explorationNumber: video.explorationNumber,
            })
            .then( () => {
                // console.log('stored in repository');
                const fileName = `/app/video/${video.sessionId}_${video.explorationNumber}.webm`;
                writeFileSync(fileName, video.buffer);
                //console.log("file stored:", fileName);
            });
    }

    public findVideo(sessionId: string, explorationNumber: number): Promise<Video | undefined> {
        return VideoSchema.findOne({sessionId, explorationNumber})
            .then((videoData) => {
                if (videoData === undefined || videoData === null) {
                   return undefined;
                } else {
                    const buffer = readFileSync(`/app/video/${videoData.sessionId}_${videoData.explorationNumber}.webm`);
                    return new Video(videoData.sessionId, videoData.explorationNumber, buffer);
                }
            });
    }

    public findVideoBySession(sessionId: string): Promise<{explorationNumber: number}[]> {
        return VideoSchema.find({sessionId})
            .then((videoDataList) => {
                return videoDataList.map((videoData) => {
                    return {
                        explorationNumber: videoData.explorationNumber,
                    };
                });
            });
    }
}
