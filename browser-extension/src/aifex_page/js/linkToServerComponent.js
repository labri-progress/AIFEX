function renderLinkToServerComponent() {
    let component = document.getElementById('linkToServerComponent');
    if (state.pageKind === 'Configure') {
        component.style.display = "block";
    } else {
        component.style.display = "none";
    }
}

function handleServerLink(e) {
    console.log('link server');
    if (e.type === "keydown" && e.key !== "Enter") {
        console.log("key",e.key);
        return;
    }
    e.preventDefault();
    
    const INPUT_URL = document.getElementById("serverURLInput").value;
    try {
        new URL(INPUT_URL);
    } catch (e) {
        document.getElementById('linkToServerMessage').innerHTML = 'Incorrect URL, please enter a correct URL.';
        return;
    }
    sendMessage({ kind: "linkServer", url: INPUT_URL })
        .then(response => {
            console.log(response);
            if (!response) {
                console.error(`Background does not answer`);
                document.getElementById('linkToServerMessage').innerHTML = 'Something goes wrong, the extension does not answer.';
            }
            else if (response.error) {
                document.getElementById('linkToServerMessage').innerHTML = 'The server does not answer, please check the URL.';
            }
            else {
                sendMessage({ kind: "checkDeprecated", url: INPUT_URL })
                    .then(compatibilityCheck => {
                        console.log(compatibilityCheck);
                        if (compatibilityCheck.extensionVersion === undefined || compatibilityCheck.serverVersion === undefined || compatibilityCheck.extensionVersion !== compatibilityCheck.serverVersion) {
                            document.getElementById('connexionMessage').innerHTML = `Your current version ${extensionInfo.currentVersion} of the AIFEX Extention is deprecated, please get latest version <a href="${extensionInfo.url}"> ${extensionInfo.latestVersion} </a>`;
                        } else {
                            getStateAndRender();
                        }
                    });
            }
        })
}

document.getElementById("linkToServerButton").addEventListener("click", handleServerLink);
document.getElementById("serverURLInput").addEventListener("keydown", handleServerLink);

addComponentToPopup(renderLinkToServerComponent);

console.log('LinkToServer Component has been launched');
