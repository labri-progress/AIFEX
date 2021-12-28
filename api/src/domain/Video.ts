export default class Video {
    readonly sessionId: string;
    readonly explorationNumber: number;
    readonly buffer : Buffer | undefined;

    constructor(sessionId: string, explorationNumber: number, buffer:Buffer|undefined) {
        if (sessionId === null || sessionId === undefined) {
            throw new Error("cannot create video, sessionId is null or undefined");
        }
        this.sessionId = sessionId;

        if (explorationNumber === null || explorationNumber === undefined) {
            throw new Error("cannot create video, explorationNumber is null or undefined");
        }
        this.explorationNumber = explorationNumber;

        this.buffer = buffer;
    }
}
