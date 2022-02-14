(() => {
    let component = document.getElementById('makeExplorationComponent');
    let makeExplorationTitle = document.getElementById('makeExplorationTitle');
    let playButton = document.getElementById('play-button');
    let stopButton = document.getElementById('stop-button');
    let trashButton = document.getElementById('trash-button');
    let obsersationButton = document.getElementById('obsersation-button');
    let obsersationSubComponent = document.getElementById('obsersationSubComponent');
    let submitObsersationButton = document.getElementById('submit-obsersation');
    let obsersationForm = document.getElementById('obsersationForm');
    let readObsersationButton = document.getElementById('read-obsersation-button');
    let obsersationList = document.getElementById('obsersation-list');

    let readObsersationIsVisible = false;
    let addObsersationIsVisible = false;

    function render() {
        if (state.showConfig) {
            component.style.display = 'none';
        } else {
            if (state.pageKind === 'Explore') {
                component.style.display = 'flex';
            } else {
                component.style.display = 'none';
            }
            if (state.isRecording) {
                makeExplorationTitle.innerHTML = 'Stop/Save your exploration or Trash it';
                playButton.style.display = 'none';
                stopButton.style.display = 'flex';
                trashButton.style.display = 'flex';
                obsersationSubComponent.style.display = 'flex';
                obsersationForm.style.display = 'none';

                if (state.lastInteractionObsersation) {
                    document.getElementById("obsersationType").value = state.lastInteractionObsersation.kind;
                    document.getElementById("obsersationDescription").value = state.lastInteractionObsersation.value;
                    document.getElementById("obsersationIsSubmitted").style.display = 'flex'
                    document.getElementById("submit-obsersation").style.display = 'none'
                    document.getElementById("obsersationType").disabled = true;
                    document.getElementById('obsersationDescription').disabled = true;
                    document.getElementById('clearObsersation').style.display = "none";

                } else {
                    document.getElementById("obsersationIsSubmitted").style.display = 'none'
                    document.getElementById("submit-obsersation").style.display = 'flex'
                }

                if (state.obsersationDistributionList && state.obsersationDistributionList.length > 0) {
                    readObsersationButton.style.display = 'flex';
                } else {
                    readObsersationButton.style.display = 'none';
                }
            } else {
                makeExplorationTitle.innerHTML = 'Start a new exploration';
                playButton.style.display = 'flex';
                stopButton.style.display = 'none';
                trashButton.style.display = 'none';
                obsersationSubComponent.style.display = 'none';
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
    
    function trashExploration() {
        console.log('handle trash');
        sendMessage({
            kind: 'removeExploration'
        })
            .then((response) => {
                if (response.error) {
                    console.error('handle trash', response.error);
                } else {
                    getStateAndRender()
                }
            })
            .catch(e => {
                console.error('handle trash', e);
            })
    }

    function openObsersationView() {
        if (!addObsersationIsVisible) {
            obsersationForm.style.display = 'block';
            if (document.getElementById("obsersationSuccessul")) {
                document.getElementById("obsersationSuccessul").style.display = 'none';
            }
            addObsersationIsVisible = true;
        } else {
            obsersationForm.style.display = 'none';
            addObsersationIsVisible = false;
        }
    }

    function submitObsersation(e) {
        e.preventDefault();
        console.log('submit bug report');

        const type = document.getElementById('obsersationType').value;
        const value = document.getElementById('obsersationDescription').value;
        sendMessage({
            kind: "pushObsersation",
            type,
            value
        })
            .then(response => {
                if (response.error) {
                    console.error(response.error)
                    return;
                } else {
                    const screenshot = document.getElementById('obsersationScreenshot').checked;
                    if (screenshot) {
                        sendMessage({
                            kind: "takeScreenshot"
                        })
                    }
                    document.getElementById("obsersationIsSubmitted").style.display = 'flex'
                    document.getElementById("submit-obsersation").style.display = 'none'
                    document.getElementById("obsersationType").disabled = true;
                    document.getElementById('obsersationDescription').disabled = true;
                    document.getElementById('clearObsersation').style.display = "none";
                }
                
            });
    }

    function readObsersations() {
        if (!readObsersationIsVisible) {
            if (state.obsersationDistributionList && state.obsersationDistributionList.length > 0) {
                obsersationList.style.display = 'flex';
                obsersationList.style.flexDirection = 'column';
                if (obsersationList.children.length === 0) {
                    state.obsersationDistributionList.forEach((obsersationDistribution, i) => {
                        if (obsersationDistribution._obsersation) {
                            let [kind, description] = obsersationDistribution._obsersation.split('$');
                            let obsersationId = document.createElement('div');
                            obsersationId.innerHTML = `Obsersation ${i + 1}`;
                            obsersationId.className = 'obsersation-id';
                            let obsersationKind = document.createElement('div');
                            obsersationKind.className = 'obsersation-kind';
                            obsersationKind.innerHTML = "kind:" + kind;
                            let obsersationDescription = document.createElement('div');
                            obsersationDescription.className = 'obsersation-description';
                            obsersationDescription.innerHTML = "description:" + description;
                            obsersationList.appendChild(obsersationId);
                            obsersationList.appendChild(obsersationKind);
                            obsersationList.appendChild(obsersationDescription);
                        }
                    });
                }
                readObsersationIsVisible = true;
            }
        } else {
            obsersationList.style.display = 'none';
            readObsersationIsVisible = false;
        }
    }

    playButton.addEventListener('click', startExploration);
    stopButton.addEventListener('click', stopExploration);
    trashButton.addEventListener('click', trashExploration);
    obsersationButton.addEventListener('click', openObsersationView);
    submitObsersationButton.addEventListener('click', submitObsersation);
    readObsersationButton.addEventListener('click', readObsersations);

    addComponentToPopup(render);

    console.log('MakeExplorations Component has been launched');


})();

