import { logger } from "../framework/Logger";
import WindowOption from "./WindowOption";

export function createWindow(options: WindowOption): Promise<browser.windows.Window> {
    return browser.windows.create(options);
}

export function getCurrentWindow(): Promise<browser.windows.Window> {
    return browser.windows.getCurrent({populate: true});
}

export function getWindowById(windowId: number):Promise<browser.windows.Window> {
    return browser.windows.get(windowId, {populate: true});
}

export function updateWindowById(windowId: number, options : {drawAttention: boolean,focused: boolean}):Promise<void> {
    return browser.windows.update(windowId, options).then(()=> {return});
}

export function getTabById(tabId: number):Promise<browser.tabs.Tab> {
    return browser.tabs.get(tabId);
}

export function removeWindowById(windowId: number): Promise<void> {
    return browser.windows.remove(windowId);
}

export function createTab(options:{windowId:number, index?:number, url?:string }): Promise<browser.tabs.Tab> {
    return browser.tabs.create(options);
}

export function removeTabs(tabIds:number[]): Promise<void> {
    return browser.tabs.remove(tabIds);
}

export function focusTab(tabId : number): Promise<void> {
    return browser.tabs.update({active: true}).then(() => {
        return;
    })
}

export function executeTabScript(tabId: number): Promise<boolean> {
    return browser.tabs.executeScript(tabId, {file: 'tabScript.js'})
        .then(() => {
            return true;
        })
        .catch( e => {
            return false;
        });
}

export function sendMessageToTab(message={}, messageKind : string, tabId: number): Promise<any> {
    const messageData = Object.assign(message, {kind: messageKind});
    return browser.tabs.sendMessage(tabId, messageData)
        .then((result : any) => {
            return result;
        })
        .catch((error) => {
            if (error.message.startsWith('The message port closed before a response was received')) {
                logger.debug(`no receiver for the message (${message}) for tabId:${tabId}`)
            } 
            else if (error.message.startsWith(`Could not establish connection. Receiving end does not exist`)) {
                logger.debug(`Could not establish connection. Receiving end does not exist`);
            } else {
                logger.error(error.message, error);
            }
            
        })
}

export function sendMessageToExtension(message={}, messageKind : string): Promise<any> {
    const messageData = Object.assign(message, {kind: messageKind});
    return browser.runtime.sendMessage(messageData, undefined)
        .catch((error) => {
            if (error.message.includes("Receiving end does not exist.")) {
                return;
            }
            logger.error(error.message, error);
        })
}

export function takeScreenshot(windowId : number): Promise<string> {
    return browser.tabs.captureVisibleTab(windowId, {format : "jpeg",quality : 100});
}


export function captureStreamOnWindow() : Promise<{stream : MediaStream, id: number}> {
    return navigator.mediaDevices.getUserMedia({
        audio: false,
        video: true
    })
    .then((stream)=> {
        return {
            stream,
            id: parseInt(stream.id, 10)
        }
    })
    
}

