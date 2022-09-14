import Action from "../domain/Action";
import BackgroundService from "../domain/BackgroundService";
import { logger } from "../framework/Logger";


export default class ChromeBackgroundMessageService  implements BackgroundService {

    sendAction(action: Action): Promise<void> {
        logger.debug(`send action: ${action}`);
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                action,
                kind: 'pushAction'
            }, {}, () => {
                const error = chrome.runtime.lastError;
                    if (error) {
                        return reject(error);
                    } else {
                        return resolve();
                    }
            })
        })
    }

}

