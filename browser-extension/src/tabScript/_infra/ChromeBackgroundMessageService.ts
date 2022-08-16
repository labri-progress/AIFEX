import Action from "../domain/Action";
import BackgroundService from "../domain/BackgroundService";


export default class ChromeBackgroundMessageService  implements BackgroundService {

    sendAction(action: Action): Promise<void> {
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

