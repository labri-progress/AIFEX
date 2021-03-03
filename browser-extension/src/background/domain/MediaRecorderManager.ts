import { logger } from "../framework/Logger";
import BrowserService from "./BrowserService";

export default class MediaRecorderManager {
    private _browserService : BrowserService;
    private _isPreparedToRecordMedia : boolean;
    private _recordedChunks : Blob[];
    private _recorder : MediaRecorder | undefined;
    private _captureId : number | undefined;

    constructor(browserService : BrowserService) {
        this._browserService = browserService;
        this._isPreparedToRecordMedia = false;
        this._recordedChunks = [];
    }

    get isPreparedToRecordMedia(): boolean {
        return this._isPreparedToRecordMedia;
    }

    prepareRecording() : Promise<void>{
        this._recordedChunks = [];
        return this._browserService.captureStreamOnWindow()
        .then((capturedStream) => {
            if (capturedStream.stream !== null) {
                logger.debug(`id:${capturedStream.id}`);
                capturedStream.stream.getVideoTracks()[0].onended = () => {
                    logger.debug('ended');
                    this.destroyRecording();
                };
                this._captureId = capturedStream.id;
                const options = {mimeType: 'video/webm; codecs=vp9'};
                this._recorder = new MediaRecorder(capturedStream.stream, options);
                this._recorder.ondataavailable = event => {
                        logger.debug(`video event:${event}`);
                        if (event.data.size > 0) {
                            logger.debug('push on recordedChunks');
                            this._recordedChunks.push(event.data);
                        }
                    };
                this._recorder.onerror = (error) => {
                    logger.error('error',error.error);
                }
                this._isPreparedToRecordMedia = true;
            }
        })
    }

    destroyRecording() : Promise<void> {
        logger.debug("destory");
        this._recordedChunks = [];
        if (this._isPreparedToRecordMedia && this._recorder && this._captureId) {
            this._recorder.stream.getTracks().forEach((track: MediaStreamTrack) => {
                logger.debug('stop track');
                track.stop();
            });
            this._browserService.hideCapture(this._captureId);
            this._isPreparedToRecordMedia = false;
            return Promise.resolve();
        } else {
            return Promise.resolve();
        }
    }

    startRecording() : Promise<void> {
        return new Promise((resolve, reject) => {
            logger.debug("start");
            if (!this._isPreparedToRecordMedia) {
                resolve();
            } else {
                if (this._recorder) {
                    this._recordedChunks = [];
                    this._recorder.onstart = () => {
                        resolve();
                    }
                    try {
                        this._recorder.start();
                    } catch(e) {
                        reject(e);
                    }
                } else {
                    resolve();
                }
            }
        })
    }

    stopRecording() : Promise<void>{
        return new Promise((resolve, reject) => {
            if (!this._isPreparedToRecordMedia) {
                resolve();
            } else {
                if (this._recorder) {
                    this._recordedChunks = [];
                    this._recorder.onstop = () => {
                        resolve();
                    }
                    if (this._recorder.state !== "inactive") {
                        try {
                            this._recorder.stop();
                        } catch(e) {
                            reject(e);
                        }
                    } else {
                        resolve();
                    }
                } else {
                    resolve();
                }
            }
        })


    }

    getRecordedChunks() : Blob | undefined {
        if (this._recordedChunks.length > 0) {
            return new Blob(this._recordedChunks, {type : 'video/webm'});
        }
    }

}