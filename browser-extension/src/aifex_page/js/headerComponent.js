function renderHeader() {
    let component = document.querySelector('header');
    component.style.display = 'block';
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

addComponentToPopup(renderHeader);

console.log('Header Component has been launched');
