export default class Video {
    private _sessionId: string;
    private _explorationNumber: number;
    private _buffer : Buffer;

    constructor(sessionId: string, explorationNumber: number, buffer:Buffer) {
        if (sessionId === null || sessionId === undefined) {
            throw new Error("cannot create screenshot, sessionId is null or undefined");
        }
        this._sessionId = sessionId;

        if (explorationNumber === null || explorationNumber === undefined) {
            throw new Error("cannot create screenshot, explorationNumber is null or undefined");
        }
        this._explorationNumber = explorationNumber;

        if (buffer === null || buffer === undefined) {
            throw new Error("cannot create video, buffer is null or undefined");
        }
        this._buffer = buffer;
    }

    get sessionId(): string {
        return this._sessionId;
    }

    get explorationNumber(): number {
        return this._explorationNumber;
    }

    get buffer(): Buffer {
        return this._buffer ;
    }

}
