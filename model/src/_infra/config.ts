const github = {
    database: 'mongodb://mongo:27017/DEVmodelDB',
    elastic: 'http://elasticsearch:9200',
    elasticPassword: process.env.ELASTIC_PASSWORD||"changeme",
    rabbitmq: 'rabbitmq',
    port: 5007,
    socketPort: 8080,
    host: "model",
    session: {
        host: "session",
        port: 5006
    }
}

const development = {
    database: 'mongodb://mongo:27017/DEVmodelDB',
    elastic: 'http://elasticsearch:9200',
    elasticPassword: process.env.ELASTIC_PASSWORD||"changeme",
    rabbitmq: 'rabbitmq',
    port: 5007,
    socketPort: 8080,
    host: "model",
    session: {
        host: "session",
        port: 5006
    }
}

const production = {
    database: 'mongodb://mongo:27017/modelDB',
    elastic: 'http://elasticsearch:9200',
    elasticPassword: process.env.ELASTIC_PASSWORD||"changeme",
    rabbitmq: 'rabbitmq',
    port: 5007,
    socketPort: 8080,
    host: "model",
    session: {
        host: "session",
        port: 5006
    }
}

let config : {
    database: string,
    elastic: string,
    elasticPassword: string,
    rabbitmq: string,
    port: number,
    socketPort: number,
    host: string,
    session: {
        host: string,
        port: number
    }};
switch(process.env.NODE_ENV) {
    case 'production':
        config = production
        break;
    case 'development': 
        config = development
        break;
    case 'github':
        config = github
    default: 
        config = development
}
export default config
