export default class Video {
    readonly sessionId: string;
    readonly explorationNumber: number;
    readonly buffer : Buffer;

    constructor(sessionId: string, explorationNumber: number, buffer:Buffer) {
        if (sessionId === null || sessionId === undefined) {
            throw new Error("cannot create screenshot, sessionId is null or undefined");
        }
        this.sessionId = sessionId;

        if (explorationNumber === null || explorationNumber === undefined) {
            throw new Error("cannot create screenshot, explorationNumber is null or undefined");
        }
        this.explorationNumber = explorationNumber;

        if (buffer === null || buffer === undefined) {
            throw new Error("cannot create video, buffer is null or undefined");
        }
        this.buffer = buffer;
    }
}
