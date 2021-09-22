function renderHeader() {
    let component = document.querySelector('header');
    component.style.display = 'flex';
}

document.getElementById("detach-button").addEventListener("click", (e) => {
    e.preventDefault();
    sendMessage({
        kind: "toggleDetachPopup",
    })
    .then(response => {
        if (!response) {
            console.error(`Background does not answer`);
        }
        else if (response.error) {
            console.error(response.error);
        } else {
            window.close();
        }
    });
})

document.getElementById("configure-button").addEventListener("click", (e) => {
    e.preventDefault();
    sendMessage({
        kind: "changePopupPageKind",
        popupPageKind: "Configure",
    })
    .then(() => {
        getStateAndRender();
    });
})


addComponentToPopup(renderHeader);

console.log('Header Component has been launched');
