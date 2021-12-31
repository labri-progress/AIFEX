(() => {
    let component = document.getElementById('descriptionOfTheSession');
    let converter = new showdown.Converter();
    let recordMediaStatus = document.getElementById('recordMediaStatus');

    function render() {
        recordMediaStatus.checked = state.isPreparedToRecordMedia;
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

    recordMediaStatus.addEventListener('change', (event) => {
        event.preventDefault();
        sendMessage({ kind: "setRecordMediaStatus", recordMediaStatus: recordMediaStatus.checked })
            .then(() => {
                getStateAndRender();
            })
    });

    document.getElementById('sessionDescriptionButton').addEventListener('click', (e) => {
        sendMessage({ kind: "changePopupPageKind", popupPageKind: 'Explore' })
            .then(() => {
                getStateAndRender();
            });
    });
    addComponentToPopup(render);

    console.log('Session Description Component has been launched');

})();
