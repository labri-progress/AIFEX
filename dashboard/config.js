
const config = {
    chromeStoreURL: "https://chrome.google.com/webstore/detail/aifex-ai-for-exploratory/dmpbhianmdipngcgmkoijmaphnkhchaj",
}

const development = {
    databaseURL: 'mongodb://mongo:27017',
    databaseName: 'DEVdashboardDB',
    elastic: 'http://elasticsearch:9200',
    elasticPassword: process.env.ELASTIC_PASSWORD||"changeme",
    port: 80,
    host: "localhost",

    website: {
        host: "website",
        port: 5005,
        
    },
    session: {
        host: "session",
        port: 5006
    },
    model: {
        host: "model",
        port: 5007,
        socketProtocol: "http",
        socketHost: "localhost",
        socketPort: 8080
    },
    account: {
        host: "account",
        port: 5008
    },
    printer: {
        host: "printer",
        port: 5009
    },
    evaluator: {
        host: "evaluator",
        port: 5010
    },
}

const production = {
    databaseURL: 'mongodb://mongo:27017',
    databaseName: 'dashboardDB',
    elastic: 'http://elasticsearch:9200',
    elasticPassword: process.env.ELASTIC_PASSWORD||"changeme",
    port: 80,
    host: "dashboard",
    
    website: {
        host: "website",
        port: 5005
    },
    session: {
        host: "session",
        port: 5006,
    },
    model: {
        host: "model",
        port: 5007,
        socketProtocol: process.env.PROTOCOL,
        socketPort: 80
    },
    account: {
        host: "account",
        port: 5008
    },
    printer: {
        host: "printer",
        port: 5009
    },
    evaluator: {
        host: "evaluator",
        port: 5010
    },
}

const github = {
    databaseURL: 'mongodb://mongo:27017',
    databaseName: 'dashboardDB',
    elastic: 'http://elasticsearch:9200',
    elasticPassword: process.env.ELASTIC_PASSWORD||"changeme",

    port: 80,
    host: "dashboard",
    website: {
        host: "website",
        port: 5005
    },
    session: {
        host: "session",
        port: 5006,
    },
    model: {
        host: "model",
        port: 5007,
        socketProtocol: "http",
        socketHost: "localhost",
        socketPort: 8080
    },
    account: {
        host: "account",
        port: 5008
    },
    printer: {
        host: "printer",
        port: 5009
    },
    evaluator: {
        host: "evaluator",
        port: 5010
    },
}

switch(process.env.NODE_ENV) {
    case 'github': 
        Object.assign(config, github)
        break;
    case 'production':
        Object.assign(config, production)
        break;
    case 'development': 
        Object.assign(config, development)
        break;
    default: 
        Object.assign(config, development)
}
module.exports = config