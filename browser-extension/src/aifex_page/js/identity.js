document.getElementById("testerNameInput").addEventListener("change", handleSet);


function handleSet(e) {
    e.preventDefault()
    const testerName = document.getElementById("testerNameInput").value
    if (!testerName) {
        return
    }

    sendMessage({
        kind: "changeTesterName",
        testerName
    })
    .then(response => {
        if (response) {
            getState();
        }
    });
}
