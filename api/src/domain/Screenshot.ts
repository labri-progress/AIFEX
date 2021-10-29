export default class Screenshot {
    readonly sessionId: string;
    readonly explorationNumber: number;
    readonly interactionIndex: number;
    readonly image: string;

    constructor(sessionId: string, explorationNumber: number, interactionIndex: number, image:string) {
        if (sessionId === null || sessionId === undefined) {
            throw new Error("cannot create screenshot, sessionId is null or undefined");
        }
        this.sessionId = sessionId;

        if (explorationNumber === null || explorationNumber === undefined) {
            throw new Error("cannot create screenshot, explorationNumber is null or undefined");
        }
        this.explorationNumber = explorationNumber;

        if (interactionIndex === null || interactionIndex === undefined) {
            throw new Error("cannot create screenshot, interactionIndex is null or undefined");
        }
        this.interactionIndex = interactionIndex;

        if (image === null || image === undefined) {
            throw new Error("cannot create screenshot, image is null or undefined");
        }
        this.image = image;
    }

}
