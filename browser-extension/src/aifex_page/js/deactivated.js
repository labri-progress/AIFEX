let drawAttentionButton = document.getElementById("draw-attention-button");

document.querySelector('header').style.display = 'flex';


drawAttentionButton.addEventListener("click", (e) => {
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