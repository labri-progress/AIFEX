var state = {};
let renderFunctionOfComponents = [];

function addComponentToPopup(renderFunction) {
    renderFunctionOfComponents.push(renderFunction);
}

function getStateAndRender() {
    sendMessage({ kind: "getStateForPopup" })
        .then(newState => {
            if (newState !== undefined) {
                state = newState;
                if (!state.popupIsDetached && state.managedWindowId) {
                    getCurrentWindow()
                        .then( currentWindow => {
                            if (currentWindow.id !== state.managedWindowId) {
                                let container = document.getElementById("container");
                                container.innerHTML = "<div>AIFEX runs in another window</div>";
                                let headerButtons = document.getElementById("header-buttons");
                                headerButtons.innerHTML = "";
                            } else {
                                renderFunctionOfComponents.forEach(renderFunction => renderFunction());
                            }
                        });
                } else {
                    renderFunctionOfComponents.forEach(renderFunction => renderFunction());
                }
            }
        });
}

getStateAndRender();
