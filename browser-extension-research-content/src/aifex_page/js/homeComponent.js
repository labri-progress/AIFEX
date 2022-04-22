(() => {
    let component = document.getElementById('homeComponent');

    function render() {
        if (state.popupPageKind === 'Home') {
            component.style.display = 'flex';
        } else {
            component.style.display = 'none';
        }
        
    }

    function join(e) {
        state.popupPageKind = 'ConnectToSession';
        setStateToStorage(state)
            .then(() => {
                getStateAndRender();
            });
    }

    function create(e) {
    }

    document.getElementById('goToJoinSession').addEventListener('click', join);
    document.getElementById('goToCreateSession').addEventListener('click', create);
    addComponentToPopup(render);

    console.log('Home Component has been launched');

})();
