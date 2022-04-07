 if (navigator.userAgent.toLowerCase().indexOf('chrome') !== -1) {
    //console.log('chrome');
    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => handleMessage(msg, sendResponse));
} else {
    //console.log('firefox');
    browser.runtime.onMessage.addListener((msg, sender, sendResponse) => handleMessage(msg, sendResponse));
}

function handleMessage(msg, sendResponse) {
    switch(msg.kind) {
        case "refresh":
            const state = msg.state
            if (state === undefined) {
                console.error("State received is empty")
                sendResponse("State received is empty");
                return;
            }
            render(state)
            sendResponse("ok");
            return;
            
        case "displayInvalidExploration":
            displayInvalidExploration();
            sendResponse("ok");
            return;
    }
}
