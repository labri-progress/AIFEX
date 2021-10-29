export default class Screenshot {
    image : string;
    interactionIndex : number;
    explorationNumber : number | undefined;
    sessionId : string | undefined;

    constructor(image : string, interactionIndex : number) {
        this.image = image;
        this.interactionIndex = interactionIndex;
    }

}