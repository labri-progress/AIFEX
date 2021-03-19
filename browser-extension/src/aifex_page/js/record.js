document.getElementById("play-button").addEventListener("click", handlePlay);
document.getElementById("stop-button").addEventListener("click", handleStop);
document.getElementById("play-restart").addEventListener("click", handleRestart);
document.getElementById("trash").addEventListener("click", handleTrash);
document.getElementById("mediaRecording").addEventListener("change", handleMediaRecord);

function handlePlay() {
    console.log('start exploration');
    sendMessage({
        kind: 'startExploration'
    })
    .then (newState => {
        if (newState.error) {
            getState();
        } else {
            render(newState);
        }
    })
    .catch(e => {
        console.error('start exploration error', e);
    })
}

function handleStop() {
    console.log('handle stop');
    sendMessage({
        kind: 'stopExploration'
    })
    .then(newState => {
        if (!newState) {
            console.log(runtime.lastError);
        }
        render(newState)
    })
    .catch(e => {
        console.error('stop exploration error', e);
    })
}

function handleRestart() {
    console.log('restart exploration');
    sendMessage({
        kind: 'restartExploration'
    })
    .then(newState => {
        render(newState)
    })
    .catch(e => {
        console.error('restart exploration error', e);
    })
}

function handleTrash() {
    console.log('handle trash');
    sendMessage({
        kind: 'removeExploration'
    })
    .then(newState => {
        render(newState)
    })
    .catch( e => {
        console.error('handle trash', e);
    })
}

function handleMediaRecord() {
    console.log('setRecordMediaStatus');
    sendMessage({
        kind: 'setRecordMediaStatus',
        recordMediaStatus:document.getElementById("mediaRecording").checked
    })
    .then(response => {
        if (response === "notok") {
            document.getElementById("mediaRecording").checked = false;
        }
    })
    .catch(e => {
        console.error('set record media status ',e);
    })
}
