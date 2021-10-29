export default class Screenshot {
    private _sessionId: string;
    private _explorationNumber: number;
    private _interactionIndex: number;
    private _image: string;

    constructor(sessionId: string, explorationNumber: number, interactionIndex: number, image:string) {
        if (sessionId === null || sessionId === undefined) {
            throw new Error("cannot create screenshot, sessionId is null or undefined");
        }
        this._sessionId = sessionId;

        if (explorationNumber === null || explorationNumber === undefined) {
            throw new Error("cannot create screenshot, explorationNumber is null or undefined");
        }
        this._explorationNumber = explorationNumber;

        if (interactionIndex === null || interactionIndex === undefined) {
            throw new Error("cannot create screenshot, interactionIndex is null or undefined");
        }
        this._interactionIndex = interactionIndex;

        if (image === null || image === undefined) {
            throw new Error("cannot create screenshot, image is null or undefined");
        }
        this._image = image;
    }

    get sessionId(): string {
        return this._sessionId;
    }

    get explorationNumber(): number {
        return this._explorationNumber;
    }

    get interactionIndex(): number {
        return this._interactionIndex;
    }

    get image(): string {
        return this._image;
    }

}
