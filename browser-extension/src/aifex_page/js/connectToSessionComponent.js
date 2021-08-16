function renderConnectToSessionComponent() {
    let component = document.getElementById('connectToSessionComponent');
    if (state.pageKind === 'ConnectToSession') {
        component.style.display = 'block';
    } else {
        component.style.display = 'none';
    }
}

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


addComponentToPopup(renderConnectToSessionComponent);