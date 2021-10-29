import Video from "./Video";

export default interface VideoRepository {

    addVideo(video:Video): Promise<void>;

    findVideo(sessionId: string, explorationNumber: number): Promise<Video | undefined>;
    
    findVideoBySession(sessionId: string): Promise<Array<{explorationNumber:number}> | undefined>;

}
