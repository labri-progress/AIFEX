(() => {
    let component = document.getElementById('connectToSessionComponent');

    function render() {
        if (state.pageKind === 'ConnectToSession') {
            component.style.display = 'block';
        } else {
            component.style.display = 'none';
        }
    }

    function handleConnexion(e) {
        console.log('connect');
        if (e.type === "keydown" && e.key !== "Enter") {
            console.log("key", e.key);
            return;
        }
        e.preventDefault();

        const INPUT_URL = document.getElementById("connexionURLInput").value;
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
                } else {
                    sendMessage({
                        kind: "connect",
                        url: INPUT_URL
                    })
                        .then((response) => {
                            console.log(response);
                            if (response === "Connected") {
                                getStateAndRender();
                            } else {
                                if (!response) {
                                    console.log(`Background does not answer`);
                                } else if (response.error) {
                                    console.log(response.error);
                                    document.getElementById('connexionMessage').innerHTML = response.error;
                                } else {
                                    document.getElementById('connexionMessage').innerHTML = response;
                                }
                            }
                        })
                }
            })
    }

    document.getElementById("connexionButton").addEventListener("click", handleConnexion);
    document.getElementById("connexionURLInput").addEventListener("keydown", handleConnexion);

    addComponentToPopup(render);

    console.log('ConnectToSession Component has been launched');

})();
