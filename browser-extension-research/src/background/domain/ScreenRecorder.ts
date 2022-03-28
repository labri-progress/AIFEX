export default class ScreenRecorder {
    readonly status : ScreenRecorderStatus;

    constructor() {
        this.status = ScreenRecorderStatus.stopped;
    }

}