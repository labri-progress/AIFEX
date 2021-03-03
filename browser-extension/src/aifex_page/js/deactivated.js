document.getElementById("attach-button").addEventListener("click", (e) => {
    e.preventDefault();
    sendMessage({
        kind: "toggleDetachPopup",
    })
    .then(response => {
        if (response.error) {
            console.error(error);
        } else {
            window.close();
        }
    });
})