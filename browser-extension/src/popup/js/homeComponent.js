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

    document.getElementById('goToJoinSession').addEventListener('click', join);
    addComponent(render);

    console.log('Home Component has been launched');

})();
