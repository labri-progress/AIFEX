document.getElementById("attach-button").addEventListener("click", (e) => {
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

document.getElementById("draw-attention-button").addEventListener("click", (e) => {
    e.preventDefault();
    sendMessage({
        kind: "drawAttention",
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


document.querySelector('header').style.display = 'flex';