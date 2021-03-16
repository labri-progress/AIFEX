let currentWindow;

let serverURL;
let testerName;
let isTabScriptDisplayingUserView;
let shouldCreateNewWindowsOnConnect;

getState();

document.getElementById("detach-button").addEventListener("click", (e) => {
    e.preventDefault();
    toggleDetachPopup()
});

function getState() {
    sendMessage({kind: "getStateForPopup"})
    .then(newState => {
        if (newState !== undefined) {
            state = newState
            render(state);
        }
    });
}

function render(state) {
    shouldCreateNewWindowsOnConnect = state.shouldCreateNewWindowsOnConnect;
    if (!state.url) {
        renderNotConnected(state);
    } else {
        serverURL = state.url;
        testerName = state.testerName;
        isTabScriptDisplayingUserView = state.isTabScriptDisplayingUserView;
        if (state.popupIsDetached) {
            renderConnected(state);
        } else {
            getCurrentWindow()
            .then( window => {
                if (window.id === state.managedWindowId) {
                    renderConnected(state);
                } else {
                    renderConnectedInOtherWindow(state);
                }
            })
        }
    }
}

function renderNotConnected(state) {
    document.getElementById("connection-component").style.display = "block";
    document.getElementById("connexionMessage").innerHTML = `You are not connected.`;
    document.getElementById("connectionURLInput").disabled = false;
    document.getElementById("connectionSignIn").style.display = "table-cell";
    document.getElementById("connectionSignOut").style.display = "none";
    document.getElementById("openSessionWindow").style.display = "none";
    document.getElementById("toggleShouldTestInNewWindowGroup").style.display = "block";
    document.getElementById("toggleShouldTestInNewWindow").checked = shouldCreateNewWindowsOnConnect;

    document.getElementById("connectedPart").hidden = true;
}

function renderConnectedInOtherWindow(state) {
    document.getElementById("connection-component").style.display = "block";
    document.getElementById("connexionMessage").innerHTML = `You are connected in another window.`;
    document.getElementById("connectionURLInput").value = serverURL;
    document.getElementById("connectionURLInput").disabled = true;
    document.getElementById("connectionSignIn").style.display = "none";
    document.getElementById("connectionSignOut").style.display = "table-cell";
    document.getElementById("openSessionWindow").style.display = "none";
    document.getElementById("toggleShouldTestInNewWindowGroup").style.display = "none";
    document.getElementById("connectionSync").style.display = "none";
    document.getElementById("openSessionWindow").style.display = "table-cell"

    document.getElementById("connectedPart").hidden = true;
}

function renderConnected(state) {
    document.getElementById("connection-component").style.display = "block";
    document.getElementById("connexionMessage").innerHTML = `You are connected`;
    document.getElementById("connectionURLInput").value = serverURL;
    document.getElementById("connectionURLInput").disabled = true;
    document.getElementById("connectionSignIn").style.display = "none";
    document.getElementById("connectionSignOut").style.display = "table-cell";
    document.getElementById("connectionSync").style.display = "table-cell";
    document.getElementById("openSessionWindow").style.display = "table-cell"

    document.getElementById("connectedPart").hidden = false;

    document.getElementById("toggleShouldTestInNewWindowGroup").style.display = "none";

    document.getElementById("mediaRecording").checked = state?.isPreparedToRecordMedia;

    if (testerName) {
        document.getElementById("testerNameInput").value = testerName
        document.getElementById("testerNameInfo").innerText = `Hello ${testerName}, you made ${state.numberOfExplorationsMadeByTester} explorations.`
    } else {
        document.getElementById("testerNameInput").value = null
        document.getElementById("testerNameInfo").innerText = `Please enter your tester name.`
    }
    
    const interactionListGroup = document.getElementById("interactionListDropdownItemGroup")
    const explorationLengthSpan = document.getElementById("explorationLength")
    while(interactionListGroup.hasChildNodes()) {
        interactionListGroup.firstChild.remove()
    }
    explorationLengthSpan.innerText = state.interactionList.length;
    state.interactionList.forEach(interaction => {
        const actionItem = document.createElement("a");
        actionItem.classList.add("dropdown-item");
        actionItem.innerText = interaction;
        interactionListGroup.appendChild(actionItem);
    });
    renderEvaluation(state)
    displayCommentList(state.commentDistributionList, state.commentUpList);
    if (!state.hasBaseURL) {
        document.getElementById("play-restart").style.display = "none";
    } else {
        document.getElementById("play-restart").style.display = "block";
    }
    
    if (state.isRecording) {
        document.getElementById("recording-status").innerHTML = "recording";
        document.getElementById("play-button").classList.add("btn-success")
        document.getElementById("trash").style.display = "inline-block";
    } else {
        document.getElementById("recording-status").innerHTML = "not recording";
        document.getElementById("play-button").classList.remove("btn-success")
        document.getElementById("trash").style.display = "none";
    }
}

function toggleDetachPopup() {
    sendMessage({
        kind: "toggleDetachPopup",
    })
    .then(response => {
        if (response.error) {
            console.error(error)
        } else {
            window.close();
        }
    });
}

function displayInvalidExploration() {
    alert(`Your test does not contain the test steps, and cannot be submitted. \n
    Either finish the test steps, or click on the trash button. \n
    The steps are indicated with the magenta outline. \n
    `);
}