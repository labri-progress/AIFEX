
const config = {
    chromeStoreURL: "https://chrome.google.com/webstore/detail/aifex-ai-for-exploratory/dmpbhianmdipngcgmkoijmaphnkhchaj",
    firefoxStoreURL: "https://addons.mozilla.org/fr/firefox/addon/aifex/",
    databaseURL: 'mongodb://mongo:27017',
    databaseName: 'DEVdashboardDB',
    elastic: 'http://elasticsearch:9200',
    elasticPassword: process.env.ELASTIC_PASSWORD||"changeme",
    port: 80,
    host: "localhost",

    api: {
        host: "api",
        port: 80,
        
    }
}

module.exports = config