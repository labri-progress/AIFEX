const fetch = require('node-fetch');

const DASHBOARD_URL = 'http://localhost/browser-script';
const CONNEXION_URL = 'http://localhost/join?sessionId=AnNbZeP_S&modelId=SjPBh9sVm';

function activate(isEnabled) {
    const ACTIVATE_URL = `${DASHBOARD_URL}`;
    let body = {
        isEnabled,
        connexionURL: CONNEXION_URL
    }
    let optionActivate = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    }
    return fetch(ACTIVATE_URL, optionActivate)
        .then(response => {
            if (response.ok) {
                return "activated"
            } else {
                return "not activated"
            }
        })
}

let isEnabled = false;
activate(isEnabled)
    .then ((result) => {
        console.log(result);
    })
    .catch((error) => {
        console.log(error);
    })