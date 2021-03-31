document.getElementById("connectionSignIn").addEventListener("click", handleConnection);
document.getElementById("connectionForm").addEventListener("submit", handleConnection);
document.getElementById("connectionSignOut").addEventListener("click", handleDisconnection);
document.getElementById("connectionSync").addEventListener("click", handleSync);
document.getElementById("openSessionWindow").addEventListener("click", handleDrawAttentionToWindow);
document.getElementById("toggleShouldTestInNewWindow").addEventListener("change", handleTestOnNewWindow);

function handleConnection(e) {
    console.log('connect');
    e.preventDefault();
    const INPUT_URL = document.getElementById("connectionURLInput").value;
    try {
        new URL(INPUT_URL);
    } catch (e) {
        document.getElementById('connexionMessage').innerHTML = 'Incorrect URL, please enter a correct URL.';
        return;
    }
    sendMessage({ kind: "checkDeprecated", url: INPUT_URL })
        .then(extensionInfo => {
            if (extensionInfo.latestVersion && extensionInfo.currentVersion !== extensionInfo.latestVersion) {
                document.getElementById('connexionMessage').innerHTML = `Your current version ${extensionInfo.currentVersion} of the AIFEX Extention is deprecated, please get latest version <a href="${extensionInfo.url}"> ${extensionInfo.latestVersion} </a>`;
                //alert(`Your current version ${extensionInfo.currentVersion} of the AIFEX Exstention is deprecated, please get latest version ${extensionInfo.latestVersion} at ${extensionInfo.url}`)
            } else {
                sendMessage({
                    kind: "connect",
                    url: INPUT_URL
                })
                .then((response) => {
                    if (!response) {
                        console.error(`Background does not answer`);
                    }
                    else if (response.error) {
                        console.error(response.error);
                        document.getElementById('connexionMessage').innerHTML = response.error;
                        return;
                    } else {
                        getState();
                    }
                })
            }
        })
}

function handleDisconnection(e) {
    console.log('disconnect');
    e.preventDefault()
    sendMessage({
        kind: "disconnect",
    })
    .then(response => {
        if (!response) {
            console.error(`Background does not answer`);
        }
        else if (response.error) {
            document.getElementById('connexionMessage').innerHTML = 'Error, cannot disconnect';
        }
        else {
            renderNotConnected();
            connectionCode = undefined
        }
    })
}

function handleSync(e) {
    console.log('reloadWebSite');
    e.preventDefault();
    sendMessage({
        kind: "reloadWebSite",
    })
    .then(response => {
        if (!response) {
            console.error(`Background does not answer`);
        }
        else if (response.error) {
            document.getElementById('connexionMessage').innerHTML = 'Error, cannot synchronize';
        }
        else {
            document.getElementById('connexionMessage').innerHTML = 'You are still connected. WebSite is refreshed !'
        }
    })
}

function handleDrawAttentionToWindow(e) {
    console.log('drawAttention');
    e.preventDefault();
    sendMessage({
        kind: "drawAttention",
    })
    .then(response => {
        if (!response) {
            console.error(`Background does not answer`);
        }
        else if (response.error) {
            console.error(response.error);
        }
    })

}

function handleTestOnNewWindow(e) {
    console.log('createNewWindow');
    e.preventDefault();
    const testOnNewWindow = e.target.checked;
    Promise.all([
        sendMessage({
            kind: "setCreateNewWindowOnConnect",
            shouldCreateNewWindowOnConnect: testOnNewWindow
        }),
        sendMessage({
            kind: "setCloseWindowOnConnect",
            shouldCloseWindowOnDisconnect: testOnNewWindow
        })
    ]).then(() => {
        getState()
    })
}
