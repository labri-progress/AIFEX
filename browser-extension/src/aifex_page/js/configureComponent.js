(() => {
    let component = document.getElementById('configureComponent');

    function render() {
        if (state.pageKind === 'Configure') {
            component.style.display = 'flex';
        } else {
            component.style.display = 'none';
        }
    }

    addComponentToPopup(render);

    console.log('Configure Component has been launched');

})();
