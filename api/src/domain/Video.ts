export default class Video {
    readonly sessionId: string;
    readonly explorationNumber: number;
    readonly buffer : Buffer;

    constructor(sessionId: string, explorationNumber: number, buffer:Buffer) {
        this.sessionId = sessionId;
        this.explorationNumber = explorationNumber;
        this.buffer = buffer;
    }
}
