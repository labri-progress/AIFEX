const fetch = require('node-fetch');

const DASHBOARD_URL = 'https://www.aifex.fr/browser-script';
const CONNEXION_URL = 'https://www.aifex.fr/join?sessionId=1kY5WJGwe&modelId=Le8Pplzkb';

//const DASHBOARD_URL = 'http://localhost/browser-script';
//const CONNEXION_URL = 'http://localhost/join?sessionId=ZQZ8DtnOW&modelId=LSssXkXXa';

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

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

let isEnabled = true;
activate(isEnabled)
    .then ((result) => {
        console.log(result);
    })
    .catch((error) => {
        console.log(error);
    })