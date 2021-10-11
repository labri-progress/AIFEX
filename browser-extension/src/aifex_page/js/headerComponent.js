(() => {
    let component = document.querySelector('header');
    let detachButton = document.getElementById("detach-button");
    let configureButton = document.getElementById("configure-button");
    let homeButton = document.getElementById("home-button");

    function render() {
        component.style.display = 'flex';
        configureButton.style.display = 'none';
        homeButton.style.display = 'none';
        if (!state.popupIsDetached) {
            getCurrentWindow()
                .then( currentWindow => {
                    if (currentWindow.id !== state.managedWindowId) {
                        detachButton.style.display = 'none';
                    }
                });
        }
    }

    detachButton.addEventListener("click", (e) => {
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

    configureButton.addEventListener("click", (e) => {
        e.preventDefault();
        sendMessage({
            kind: "changePopupPageKind",
            popupPageKind: "Configure",
        })
            .then(() => {
                getStateAndRender();
            });
    })

    homeButton.addEventListener("click", (e) => {
        e.preventDefault();
        sendMessage({
            kind: "changePopupPageKind",
            popupPageKind: "Home",
        })
            .then(() => {
                getStateAndRender();
            });
    })


    addComponentToPopup(render);

    console.log('Header Component has been launched');

})();

