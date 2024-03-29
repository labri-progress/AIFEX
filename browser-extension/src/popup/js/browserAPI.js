function sendMessage(message) {
    if (navigator.userAgent.toLowerCase().indexOf('chrome') !== -1) {
        return new Promise( (resolve, reject) => {
            chrome.runtime.sendMessage(message,{}, (response) => {
                const error = chrome.runtime.lastError;
                if (error) {
                    reject(error)
                }
                resolve(response);
            })
        })
    } else {
        return browser.runtime.sendMessage(message);
    }
}

function getCurrentWindow() {
    if (navigator.userAgent.toLowerCase().indexOf('chrome') !== -1) {
        return new Promise( (resolve, reject) => {
            chrome.windows.getCurrent({},(window) => {
                const error = chrome.runtime.lastError;
                if (error) {
                    reject(error)
                }
                resolve(window);
            })
        });
    } else {
        return browser.windows.getCurrent().then(
            (response) => {
                return response;
            })
            .catch(error => {
                console.error("Failed to getCurrent window", error);
            })
    }
}


function getStateFromStorage() {
    return chrome.storage.local.get("AIFEX_STATE")
        .then((result) => {
            return result["AIFEX_STATE"];
        });
}

function setStateToStorage(state) {
    return chrome.storage.local.set({"AIFEX_STATE": state});
}