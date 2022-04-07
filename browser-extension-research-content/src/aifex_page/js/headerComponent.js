(() => {
    let component = document.querySelector('header');
    let detachButton = document.getElementById("detach-button");
    let attachButton = document.getElementById("attach-button");
    let closeButton = document.getElementById("disconnect-button");
    let configButton = document.getElementById("config-button");


    function render() {
        component.style.display = 'flex';
        if (state.popupIsDetached) {
            detachButton.style.display = 'none';
        } else {
            attachButton.style.display = 'none';

        }
    }

    closeButton.addEventListener("click", (e) => {
        sendMessage({
            kind: "disconnect",
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


    attachButton.addEventListener("click", (e) => {
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


    detachButton.addEventListener("click", (e) => {
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

    configButton.addEventListener("click", (e) => {
        sendMessage({
            kind: "showConfig",
        })
            .then(() => {
                getStateAndRender();
            });
    })


    addComponentToPopup(render);

    console.log('Header Component has been launched');

})();

