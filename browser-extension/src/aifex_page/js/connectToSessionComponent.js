function renderConnectToSessionComponent(state) {
    let component = document.getElementById('connectToSessionComponent');
    console.log(state.token);
    if (state.token) {
        component.style.display = 'block';
    } else {
        component.style.display = 'none';
    }
}

addComponentToPopup(renderConnectToSessionComponent);