function renderConfigure() {
    let component = document.getElementById('configureComponent');
    if (state.pageKind === 'configure') {
        component.style.display = 'flex';
    } else {
        component.style.display = 'none';
    }
}


addComponentToPopup(renderHeader);

console.log('Configure Component has been launched');
