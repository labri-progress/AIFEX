let component = document.getElementById('makeExplorationComponent');
let playButton = document.getElementById('play-button');
let stopButton = document.getElementById('stop-button');
let trashButton = document.getElementById('trash-button');

playButton.addEventListener('click', startExploration);
stopButton.addEventListener('click', stopExploration);
trashButton.addEventListener('click', trashExploration);

addComponentToPopup(renderMakeExplorationsComponent);

console.log('MakeExplorations Component has been launched');



function renderMakeExplorationsComponent() {    
    if (state.pageKind === 'Explore') {
        component.style.display = 'block';
    } else {
        component.style.display = 'none';
    }
    if (state.isRecording) {
        playButton.style.display = 'none';
        stopButton.style.display = 'block';
        trashButton.style.display = 'block';
    } else {
        playButton.style.display = 'block';
        stopButton.style.display = 'none';
        trashButton.style.display = 'none';
    }
}

function startExploration() {
    console.log('start exploration');
    sendMessage({
        kind: 'startExploration'
    })
    .then (newState => {
        getStateAndRender();
    })
    .catch(e => {
        console.error('start exploration error', e);
    })
}

function stopExploration() {
    console.log('stop exploration');
    sendMessage({
        kind: 'stopExploration'
    })
    .then(response => {
        if (response.error) {
            console.error('stop exploration error', response.error);
        }
        getStateAndRender();
    })
    .catch(e => {
        console.error('stop exploration error', e);
    })
}

// function restartExploration() {
//     console.log('restart exploration');
//     sendMessage({
//         kind: 'restartExploration'
//     })
//     .then(response => {
//         if (response.error) {
//             console.error('restart exploration error', response.error);
//         } else {
//             render(response)
//         }
//     })
//     .catch(e => {
//         console.error('restart exploration error', e);
//     })
// }

function trashExploration() {
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
