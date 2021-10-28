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
    sendMessage({
        kind: 'stopExploration'
    })
    .then(response => {
        if (response.error) {
            console.error('stop exploration error', response.error);
        } else {
            console.log(response)
            render(response)
        }
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
    .then(response => {
        if (response.error) {
            console.error('restart exploration error', response.error);
        } else {
            render(response)
        }
    })
    .catch(e => {
        console.error('restart exploration error', e);
    })
}

function handleTrash() {
    sendMessage({
        kind: 'removeExploration'
    })
    .then((response) => {
        if (response.error) {
            console.error('handle trash', response.error);
        } else {
            render(response)
        }
    })
    .catch( e => {
        console.error('handle trash', e);
    })
}

function handleMediaRecord() {
    sendMessage({
        kind: 'setRecordMediaStatus',
        recordMediaStatus: document.getElementById("mediaRecording").checked,
    }).then(response => {
        if (response && response.error !== undefined) {
            console.error("handle setRecordMediaStatus", response.error)
            document.getElementById("mediaRecording").checked = false;
        }
    })
    .catch( e => {
        console.error('setRecordMediaStatus', e);
    })
}
