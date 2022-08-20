(() => {
    let component = document.getElementById('descriptionOfTheSession');
    let converter = new showdown.Converter();
    let takeAScreenshotByAction = document.getElementById('takeAScreenshotByAction');
    let testerNameInput = document.getElementById('testerNameInDescription');

    function render() {
        takeAScreenshotByAction.checked = state.takeAScreenshotByAction;
        if (state.popupPageKind === 'ReadSessionDescription') {
            document.getElementById('sessionDescription').innerHTML = converter.makeHtml(state.sessionDescription);
            component.style.display = 'block';

        } else {
            component.style.display = 'none';
        }
    }

    document.getElementById('sessionDescriptionButton').addEventListener('click', (e) => {
        state.takeAScreenshotByAction = takeAScreenshotByAction.checked;
        state.testerName = testerNameInput.value;
        state.popupPageKind = 'Explore';
        setStateToStorage(state)
            .then(() => {
                getStateAndRender();
            });
    });

    addComponent(render);

    console.log('Session Description Component has been launched');

})();
