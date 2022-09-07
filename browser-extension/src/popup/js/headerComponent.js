(() => {
    let component = document.querySelector('header');
    let closeButton = document.getElementById("disconnect-button");


    function render() {
        component.style.display = 'flex';
    }

    closeButton.addEventListener("click", (e) => {
        state.popupPageKind = 'Home';
        state.connectedToSession = false;
        state.isRecording = false;
        state.serverURL = undefined;
        state.sessionId = undefined;
        state.sessionBaseURL = undefined;
        state.explorationNumber = undefined;
        state.explorationLength = undefined;
        state.testerName = undefined;
        state.probabilities = undefined;
        state.actions = [];
        setStateToStorage(state)
            .then(() => {
                getStateAndRender();
            });
    })


    

    addComponent(render);

    console.log('Header Component has been launched');

})();

