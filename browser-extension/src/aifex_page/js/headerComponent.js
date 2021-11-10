(() => {
    let component = document.querySelector('header');
    let detachButton = document.getElementById("detach-button");
    let attachButton = document.getElementById("attach-button");
    let closeButton = document.getElementById("disconnect-button");

    //let configureButton = document.getElementById("configure-button");


    function render() {
        component.style.display = 'flex';
        //configureButton.style.display = 'none';
        //homeButton.style.display = 'none';
        if (state.popupIsDetached) {
            detachButton.style.display = 'none';
        } else {
            attachButton.style.display = 'none';

        }
    }

    closeButton.addEventListener("click", (e) => {
        e.preventDefault();
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

    // configureButton.addEventListener("click", (e) => {
    //     e.preventDefault();
    //     sendMessage({
    //         kind: "changePopupPageKind",
    //         popupPageKind: "Configure",
    //     })
    //         .then(() => {
    //             getStateAndRender();
    //         });
    // })

    // homeButton.addEventListener("click", (e) => {
    //     e.preventDefault();
    //     sendMessage({
    //         kind: "changePopupPageKind",
    //         popupPageKind: "Home",
    //     })
    //         .then(() => {
    //             getStateAndRender();
    //         });
    // })


    addComponentToPopup(render);

    console.log('Header Component has been launched');

})();

