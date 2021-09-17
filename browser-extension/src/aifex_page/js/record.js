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
    .then(response => {
        if (response.error) {
            console.error('stop exploration error', response.error);
        } else {
            ////REMOVE THIS LINE
            if (state.interactionList.length >= 5) {
                alert(`
                Thank you for participating ! \n
                The secret sentence to validate the HIT is: \n
                Barnabas had slept well. \n
                ` )
            }
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
    console.log('handle trash');
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
