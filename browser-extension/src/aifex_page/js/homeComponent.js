(() => {
    let component = document.getElementById('homeComponent');

    function render() {
        if (state.pageKind === 'Home') {
            component.style.display = 'flex';
        } else {
            component.style.display = 'none';
        }
    }

    function join(e) {
        state.pageKind = 'ConnectToSession';
        sendMessage({ kind: "changePopupPageKind", popupPageKind: 'ConnectToSession' })
            .then(() => {
                getStateAndRender();
            });
    }

    function create(e) {
        state.pageKind = 'CreateSession';
        sendMessage({ kind: "changePopupPageKind", popupPageKind: 'CreateSession' })
            .then(() => {
                getStateAndRender();
            });
    }

    document.getElementById('goToJoinSession').addEventListener('click', join);
    document.getElementById('goToCreateSession').addEventListener('click', create);
    addComponentToPopup(render);

    console.log('Home Component has been launched');

})();
