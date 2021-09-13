function renderHome() {
    let component = document.getElementById('homeComponent');
    if (state.pageKind === 'Home') {
        component.style.display = 'flex';
    } else {
        component.style.display = 'none';
    }
}

function join(e) {
    e.preventDefault();
    state.pageKind = 'ConnectToSession';
    sendMessage({ kind: "changePopupPageKind", popupPageKind: 'ConnectToSession'})
        .then(() => {
            getStateAndRender();
        });
}

function create(e) {
    e.preventDefault();
    state.pageKind = 'CreateSession';
    sendMessage({ kind: "changePopupPageKind", popupPageKind: 'CreateSession'})
        .then(() => {
            getStateAndRender();
        });
}

document.getElementById('goToJoinSession').addEventListener('click', join);
document.getElementById('goToCreateSession').addEventListener('click', create);
addComponentToPopup(renderHome);

console.log('Home Component has been launched');
