(() => {
    let component = document.getElementById('descriptionOfTheSession');
    let converter = new showdown.Converter();

    function render() {
        if (state.showConfig) {
            component.style.display = 'none';
        } else {
            if (state.pageKind === 'ReadSessionDescription') {
                document.getElementById('sessionDescription').innerHTML = converter.makeHtml(state.sessionDescription);
                component.style.display = 'block';

            } else {
                component.style.display = 'none';
            }
        }
        
    }

    function next(e) {
        state.pageKind = 'CreateSession';
        sendMessage({ kind: "changePopupPageKind", popupPageKind: 'Explore' })
            .then(() => {
                getStateAndRender();
            });
    }

    document.getElementById('sessionDescriptionButton').addEventListener('click', next);
    addComponentToPopup(render);

    console.log('Session Description Component has been launched');

})();
