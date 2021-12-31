(() => {
    let component = document.getElementById('configureComponent');
    let testerNameInput = document.getElementById('testerName');
    let shouldCreateNewWindowsOnConnect = document.getElementById('shouldCreateNewWindowsOnConnect');
    let shouldCloseWindowOnDisconnect = document.getElementById('shouldCloseWindowOnDisconnect');
    let shouldOpenPrivateWindows = document.getElementById("shouldOpenPrivateWindows");
    let submitConfig = document.getElementById('submitConfig');
    let cancelConfig = document.getElementById('cancelConfig');
    let configForm = document.getElementById('configForm');
    

    function render() {
        testerNameInput.value = state.testerName;
        shouldCreateNewWindowsOnConnect.checked = state.shouldCreateNewWindowsOnConnect;
        shouldCloseWindowOnDisconnect.checked = state.shouldCloseWindowOnDisconnect;
        shouldOpenPrivateWindows.checked = state.shouldOpenPrivateWindows;
        if (state.showConfig) {
            component.style.display = 'block';
        } else {
            component.style.display = 'none';
        }
    }

    configForm.addEventListener('submit', (event) => {
        event.preventDefault();
        let msg = {
            kind: "submitConfig", 
            testerName: testerNameInput.value, 
            shouldCreateNewWindowsOnConnect: shouldCreateNewWindowsOnConnect.checked, 
            shouldCloseWindowOnDisconnect: shouldCloseWindowOnDisconnect.checked,
            shouldOpenPrivateWindows: shouldOpenPrivateWindows.checked
        };
        console.log(msg);
        sendMessage(msg)
            .then(() => {
                getStateAndRender();
            })
    });

    cancelConfig.addEventListener('click', (event) => {
        event.preventDefault();
        sendMessage({ kind: "cancelConfig" })
            .then(() => {
                getStateAndRender();
            })
    });


    addComponentToPopup(render);

    console.log('Configure Component has been launched');

})();
 