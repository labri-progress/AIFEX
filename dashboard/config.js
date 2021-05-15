
const config = {
    chromeStoreURL: "https://chrome.google.com/webstore/detail/aifex-ai-for-exploratory/dmpbhianmdipngcgmkoijmaphnkhchaj",
    firefoxStoreURL: "https://addons.mozilla.org/fr/firefox/addon/aifex/",
    databaseURL: 'mongodb://mongo:27017',
    databaseName: 'DEVdashboardDB',
    elastic: 'http://elasticsearch:9200',
    elasticPassword: process.env.ELASTIC_PASSWORD||"changeme",
    tokenSecret: process.env.TOKEN_SECRET||"changeme",
    port: 80,
    host: "localhost",

    website: {
        host: "website",
        port: 80,
        
    },
    session: {
        host: "session",
        port: 80
    },
    model: {
        host: "model",
        port: 80,
        socketProtocol: "http",
        socketHost: "localhost",
        socketPort: 8080
    },
    account: {
        host: "account",
        port: 80
    },
    printer: {
        host: "printer",
        port: 80
    },
    evaluator: {
        host: "evaluator",
        port: 80
    },
}

module.exports = config