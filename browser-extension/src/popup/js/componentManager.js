var state = {};
let renderFunctionOfComponents = [];

function addComponent(renderFunction) {
    renderFunctionOfComponents.push(renderFunction);
}

function getStateAndRender() {
    console.log("getStateAndRender");
    getStateFromStorage()
        .then(stateFromStorage => {
            if (stateFromStorage) {
                console.log("stateFromStorage", stateFromStorage);
                state = stateFromStorage;
            } else {
                console.log('no state in storage');
            }
            renderFunctionOfComponents.forEach(renderFunction => renderFunction());
        });
}

getStateAndRender();
