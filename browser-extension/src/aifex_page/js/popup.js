var state = {};
let renderFunctionOfComponents = [];

function addComponentToPopup(renderFunction) {
    renderFunctionOfComponents.push(renderFunction);
}

function renderComponents() {
    renderFunctionOfComponents.forEach(renderFunction => renderFunction());
}

function getStateAndRender() {
    sendMessage({ kind: "getStateForPopup" })
        .then(newState => {
            if (newState !== undefined) {
                state = newState
                renderComponents();
            }
        });
}

getStateAndRender();


