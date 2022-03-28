import WindowOption from "./WindowOption";
import {logger} from "../Logger";

export function createWindow(options: WindowOption): Promise<chrome.windows.Window> {
    return new Promise((resolve, reject) => {
        chrome.windows.create(options, (window: chrome.windows.Window | undefined) => {
            const error = chrome.runtime.lastError;
            if (error || window === undefined) {
                reject(error);
            } else {
                resolve(window);
            }
        });
    });
}

export function getCurrentWindow(): Promise<chrome.windows.Window> {
    return new Promise((resolve, reject) => {
        chrome.windows.getCurrent({populate: true}, (window: chrome.windows.Window) => {
            const error = chrome.runtime.lastError;
            if (error) {
                reject(error)
            }
            resolve(window);
        })
    });
}

export function getTabIdListOfWindow(windowId : number): Promise<number[]> {
    return new Promise((resolve, reject) => {
        chrome.windows.get(windowId, {populate: true}, (window: chrome.windows.Window) => {
            const error = chrome.runtime.lastError;
            if (error) {
                reject(error)
            }
            const tabs = window.tabs;
            if (tabs) {
                resolve(tabs.map(tab => tab.id).filter((id : number | undefined): id is number => id !== undefined));
            } else {
                return [];
            }
        })
    })
}

export function getWindowById(windowId: number):Promise<chrome.windows.Window> {
    return new Promise((resolve, reject) => {
        chrome.windows.get(windowId, {populate: true}, (window:chrome.windows.Window) => {
                const error = chrome.runtime.lastError;
                if (error) {
                    reject(error);
                } else {
                    resolve(window);
                }
            }
        );
    });
}

export function updateWindowById(windowId: number, options : {drawAttention: boolean,focused: boolean}):Promise<void> {
    return new Promise((resolve, reject) => {
        chrome.windows.update(windowId, options, (window: chrome.windows.Window) => {
                const error = chrome.runtime.lastError;
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            }
        );
    });
}

export function getTabById(tabId: number):Promise<chrome.tabs.Tab> {
    return new Promise( (resolve, reject) => {
        chrome.tabs.get(tabId, (tab:chrome.tabs.Tab) => {
            const error = chrome.runtime.lastError;
            if (error) {
                reject(error);
            } else {
                resolve(tab);
            }
        });
    });
}

export function removeWindowById(windowId: number): Promise<void> {
    return new Promise( (resolve, reject) => {
        chrome.windows.remove(windowId, () => {
            const error = chrome.runtime.lastError;
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    })
}

export function createTab(options:{windowId:number, index?:number, url:string }): Promise<chrome.tabs.Tab> {
    return new Promise((resolve, reject) => {
        chrome.tabs.create(options, (tab: chrome.tabs.Tab) => {
            const error = chrome.runtime.lastError;
            if (error) {
                reject(error);
            } else {
                resolve(tab);
            }
        });
    })
}

export function removeTabs(tabIds:number[]): Promise<void> {
    return new Promise((resolve, reject) => {
        chrome.tabs.remove(tabIds, () => {
            const error = chrome.runtime.lastError;
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        })
    })
}

export function focusTab(tabId : number): Promise<void> {
    return new Promise((resolve, reject) => {
        chrome.tabs.update(tabId, {active: true} ,() => {
            const error = chrome.runtime.lastError;
            if (error) {
                return reject(error);
            } else {
                return resolve();
            }
        })
    })
}

export function executeTabScript(tabId: number): Promise<boolean> {
    logger.info(`executre script for id:${tabId}`);
    return new Promise((resolve, reject) => {
        chrome.scripting.executeScript({target: {tabId}, files: ['tabScript.js']})
        .then(() => {
            resolve(true);
        })
        .catch((err) => {
            resolve(false);
        }); 
    });
}


export function sendMessageToPopup(message={}, messageKind : string): Promise<any> {
    const messageData = Object.assign(message, {kind: messageKind});

    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(messageData,  (response) => {
            const error = chrome.runtime.lastError;
            if (error) {
                reject(new Error(error.message));
            } else {
                resolve(response);
            }
        });
    });
}


export function sendMessageToTab(message={}, messageKind : string, tabId: number): Promise<any> {
    const messageData = Object.assign(message, {kind: messageKind});
    return new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(tabId, messageData, (response) => {
            const error = chrome.runtime.lastError;
            if (error) {
                if (error.message) {
                    if (error.message.startsWith('The message port closed before a response was received')) {
                        resolve(`no receiver for the message (${message}) for tabId:${tabId}`);
                    } 
                    else if (error.message.startsWith(`Could not establish connection. Receiving end does not exist`)) {
                        resolve(`Could not establish connection. Receiving end does not exist`);
                    }
                }
                 else {
                    reject(error);
                }
            } else {
                resolve(response);
            }
        });
    });
}

const JPG_QUALITY = 10 ; //100 is best quality
export function takeScreenshot(windowId : number): Promise<string> {
    return new Promise((resolve, reject) => {
        chrome.tabs.captureVisibleTab(windowId, {format : "jpeg",quality : JPG_QUALITY}, dataImage => {
            const error = chrome.runtime.lastError;
            if (error) {
                reject(error);
            } else {
                resolve(dataImage)
            }
        })
    })
}

export function captureStreamOnWindow() : Promise<{stream : MediaStream, id: number} | "Canceled"> {
    return new Promise((resolve, reject) => {
        const id = chrome.desktopCapture.chooseDesktopMedia(["window"], (streamId)=> {
            const chromeError = chrome.runtime.lastError;
            if (chromeError) {
                reject(chromeError);
            } else {
                if (!streamId) {
                    resolve("Canceled");
                } else {
                    const n = navigator as any;
                    n.webkitGetUserMedia({
                        video: {
                        mandatory: {
                            chromeMediaSource: 'desktop',
                            chromeMediaSourceId: streamId,
                            maxWidth:screen.width,
                            maxHeight:screen.height} }
                    }, (stream : MediaStream) => {
                        resolve({stream, id});
                    }, (error : Error) => {
                        reject(error);
                    });
                }
            }
        });
    })
}
