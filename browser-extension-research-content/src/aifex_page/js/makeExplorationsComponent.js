(() => {
    let component = document.getElementById('makeExplorationComponent');
    let makeExplorationTitle = document.getElementById('makeExplorationTitle');
    let playButton = document.getElementById('play-button');
    let stopButton = document.getElementById('stop-button');


    function render() {
        if (state.showConfig) {
            component.style.display = 'none';
        } else {
            if (state.popupPageKind === 'Explore') {
                component.style.display = 'flex';
            } else {
                component.style.display = 'none';
            }
            if (state.isRecording) {
                makeExplorationTitle.innerHTML = 'Stop/Save your exploration or Trash it';
                playButton.style.display = 'none';
                stopButton.style.display = 'flex';
            } else {
                makeExplorationTitle.innerHTML = 'Start a new exploration';
                playButton.style.display = 'flex';
                stopButton.style.display = 'none';
            }
        }
    }

    function startExploration() {
        console.log('start exploration');
        sendMessage({
            kind: 'startExploration'
        })
            .then(newState => {
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
    
    playButton.addEventListener('click', startExploration);
    stopButton.addEventListener('click', stopExploration);

    addComponentToPopup(render);

    console.log('MakeExplorations Component has been launched');


})();

