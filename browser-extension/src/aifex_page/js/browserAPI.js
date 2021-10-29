function sendMessage(message) {
    //console.log('send message:', message);
    if (navigator.userAgent.toLowerCase().indexOf('chrome') !== -1) {
        //console.log('chrome');
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
        //console.log('firefox');
        return browser.runtime.sendMessage(message)
        .then(
            (response) => {
                return response;
            })
        .catch((error) => {
            console.error("catching", error)
        })
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