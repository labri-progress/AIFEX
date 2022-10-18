(() => {
    const component = document.getElementById('makeExplorationComponent');
    const makeExplorationTitle = document.getElementById('makeExplorationTitle');
    const playButton = document.getElementById('play-button');
    const stopButton = document.getElementById('stop-button');
    const observationButton = document.getElementById('observation-button');
    const observationSubComponent = document.getElementById('observationSubComponent');
    const submitObservationButton = document.getElementById('submit-observation');
    const observationForm = document.getElementById('observationForm');
    const readObservationButton = document.getElementById('read-observation-button');
    const observationList = document.getElementById('observation-list');
    const configurationSubComponent = document.getElementById('configurationComponent');
    const overlayTypeCheckInput = document.getElementById('overlayType');
    let readObservationIsVisible = false;
    let addObservationIsVisible = false;

    function render() {
        if (state.popupPageKind === 'Explore') {
            component.style.display = 'flex';
        } else {
            component.style.display = 'none';
        }
        if (state.isRecording) {
            makeExplorationTitle.innerHTML = 'Stop/Save your exploration';
            playButton.style.display = 'none';
            stopButton.style.display = 'flex';
            observationSubComponent.style.display = 'flex';
            observationForm.style.display = 'none';
            configurationSubComponent.style.display = 'flex';
            if (state.overlayType === 'rainbow') {
                overlayTypeCheckInput.checked = true;
            } else {
                overlayTypeCheckInput.checked = false;
            }

            if (state.lastInteractionObservation) {
                document.getElementById("observationType").value = state.lastInteractionObservation.kind;
                document.getElementById("observationDescription").value = state.lastInteractionObservation.value;
                document.getElementById("observationIsSubmitted").style.display = 'flex'
                document.getElementById("submit-observation").style.display = 'none'
                document.getElementById("observationType").disabled = true;
                document.getElementById('observationDescription').disabled = true;
                document.getElementById('clearObservation').style.display = "none";

            } else {
                document.getElementById("observationIsSubmitted").style.display = 'none'
                document.getElementById("submit-observation").style.display = 'flex'
            }

            if (state.observationDistributionList && state.observationDistributionList.length > 0) {
                readObservationButton.style.display = 'flex';
            } else {
                readObservationButton.style.display = 'none';
            }
        } else {
            makeExplorationTitle.innerHTML = 'Start a new exploration';
            playButton.style.display = 'flex';
            stopButton.style.display = 'none';
            observationSubComponent.style.display = 'none';
            configurationSubComponent.style.display = 'none';
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
    

    function openObservationView() {
        if (!addObservationIsVisible) {
            observationForm.style.display = 'block';
            if (document.getElementById("observationSuccessul")) {
                document.getElementById("observationSuccessul").style.display = 'none';
            }
            addObservationIsVisible = true;
        } else {
            observationForm.style.display = 'none';
            addObservationIsVisible = false;
        }
    }

    function submitObservation(e) {
        e.preventDefault();
        console.log('submit comment');

        const type = document.getElementById('observationType').value;
        const value = document.getElementById('observationDescription').value;
        sendMessage({
            kind: "pushObservation",
            type,
            value
        })
            .then(response => {
                if (response.error) {
                    console.error(response.error)
                    return;
                } else {
                    const screenshot = document.getElementById('observationScreenshot').checked;
                    if (screenshot) {
                        sendMessage({
                            kind: "takeScreenshot"
                        })
                    }
                    document.getElementById("observationIsSubmitted").style.display = 'flex'
                    document.getElementById("submit-observation").style.display = 'none'
                    document.getElementById("observationType").disabled = true;
                    document.getElementById('observationDescription').disabled = true;
                    document.getElementById('clearObservation').style.display = "none";
                }
                
            });
    }

    function readObservations() {
        if (!readObservationIsVisible) {
            if (state.observationDistributionList && state.observationDistributionList.length > 0) {
                observationList.style.display = 'flex';
                observationList.style.flexDirection = 'column';
                if (observationList.children.length === 0) {
                    state.observationDistributionList.forEach((observationDistribution, i) => {
                        if (observationDistribution._observation) {
                            let [kind, description] = observationDistribution._observation.split('$');
                            let observationId = document.createElement('div');
                            observationId.innerHTML = `Observation ${i + 1}`;
                            observationId.className = 'observation-id';
                            let observationKind = document.createElement('div');
                            observationKind.className = 'observation-kind';
                            observationKind.innerHTML = "kind:" + kind;
                            let observationDescription = document.createElement('div');
                            observationDescription.className = 'observation-description';
                            observationDescription.innerHTML = "description:" + description;
                            observationList.appendChild(observationId);
                            observationList.appendChild(observationKind);
                            observationList.appendChild(observationDescription);
                        }
                    });
                }
                readObservationIsVisible = true;
            }
        } else {
            observationList.style.display = 'none';
            readObservationIsVisible = false;
        }
    }

    function showOverlay() {
        if (overlayTypeCheckInput.checked) {
            state.overlayType = "rainbow";
        } else {
            state.overlayType = "shadow";
        }
        setStateToStorage(state);
    }

    playButton.addEventListener('click', startExploration);
    stopButton.addEventListener('click', stopExploration);
    observationButton.addEventListener('click', openObservationView);
    submitObservationButton.addEventListener('click', submitObservation);
    readObservationButton.addEventListener('click', readObservations);
    overlayTypeCheckInput.addEventListener('click', showOverlay);

    addComponent(render);

    console.log('MakeExplorations Component has been launched');


})();

