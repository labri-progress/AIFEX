(() => {
    let component = document.getElementById('connectToSessionComponent');
    let connectionForm = document.getElementById("connectionForm");
    let connexionMessage = document.getElementById('connexionMessage');
    

    function render() {
        if (state.popupPageKind === 'ConnectToSession') {
            component.style.display = 'flex';
        } else {
            component.style.display = 'none';
        }
    }

    function handleConnexion(e) {
        e.preventDefault();
        const data = new FormData(connectionForm)
        const INPUT_URL = data.get("connexionURL");
        try {
            new URL(INPUT_URL);
        } catch (e) {
            connexionMessage.innerHTML = 'Incorrect URL, please enter a correct URL.';
            return;
        }
        sendMessage({ kind: "checkDeprecated", url: INPUT_URL })
            .then(extensionInfo => {
                console.log("extensionInfo:", JSON.stringify(extensionInfo));
                if (!checkVersion(extensionInfo.serverVersion, extensionInfo.extensionVersion)) {
                    console.log('wrong version');
                    connexionMessage.innerHTML = `Your current version ${extensionInfo.extensionVersion} of the AIFEX Extention is deprecated, please get latest version <a href="${extensionInfo.url}"> ${extensionInfo.serverVersion} </a>`;
                } else {
                    sendMessage({
                        kind: "connect",
                        url: INPUT_URL
                    })
                        .then((response) => {
                            if (response === "Connected") {
                                getStateAndRender();
                            } else {
                                if (!response) {
                                    console.log(`Background does not answer`);
                                } else if (response.error) {
                                    console.log(response.error);
                                    connexionMessage.innerHTML = response.error;
                                } else {
                                    connexionMessage.innerHTML = response;
                                }
                            }
                        })
                }
            })
    }
    addComponentToPopup(render);
    connectionForm.addEventListener("submit", handleConnexion);

    console.log('ConnectToSession Component has been launched');

})();

function checkVersion(serverVersion, extensionVersion) {
    let serverSemVer = createSemVer(serverVersion);
    let extensionSemVer = createSemVer(extensionVersion);
    if (serverSemVer === undefined || extensionSemVer === undefined) {
        return true;//for compatibility issue
    }
    if (serverSemVer.major > extensionSemVer.major) {
        return false;
    }
    if (serverSemVer.minor > extensionSemVer.minor) {
        return false;
    }
    return true;
}

function createSemVer(versionAsString) {
    const SEMVER_NAMES = ['major', 'minor', 'patch'];
    if (typeof versionAsString !== 'string') {
        return undefined;
    }
    return versionAsString.split('.').map(v => parseInt(v)).reduce((prev, cur, index, versions) => {
        if (versions.length !== 3) {
            return undefined;
        }
        if (prev === undefined) {
            return undefined
        } 
        if (isNaN(cur)) {
            return undefined;
        } 
        prev[SEMVER_NAMES[index]] = cur;
        return prev;
    }, {})
}