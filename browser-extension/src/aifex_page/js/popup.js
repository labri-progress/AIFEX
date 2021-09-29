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
                renderFunctionOfComponents.forEach(renderFunction => renderFunction());
            }
        });
}

getStateAndRender();


