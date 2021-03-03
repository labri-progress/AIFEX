const development = {
    database: 'mongodb://mongo:27017/DEVsessionDB',
    elastic: 'http://elasticsearch:9200',
    elasticPassword: process.env.ELASTIC_PASSWORD||"changeme",
    rabbitmq: 'rabbitmq',
    port: 5006,
    host: "session",
    website: {
        host: "website",
        port: 5005
    },
    model: {
        host: "model",
        port: 5007
    }
}

const github = {
    database: 'mongodb://mongo:27017/DEVsessionDB',
    elastic: 'http://elasticsearch:9200',
    elasticPassword: process.env.ELASTIC_PASSWORD||"changeme",
    rabbitmq: 'rabbitmq',
    port: 5006,
    host: "session",
    website: {
        host: "website",
        port: 5005
    },
    model: {
        host: "model",
        port: 5007
    }
}


const production = {
    database: 'mongodb://mongo:27017/sessionDB',
    elastic: 'http://elasticsearch:9200',
    elasticPassword: process.env.ELASTIC_PASSWORD||"changeme",
    rabbitmq: 'rabbitmq',
    port: 5006,
    host: "session",
    website: {
        host: "website",
        port: 5005
    },
    model: {
        host: "model",
        port: 5007
    }
}

let config : {
    database: string,
    elastic: string,
    elasticPassword: string,
    rabbitmq: string,
    port: number,
    website: {
        host: string,
        port: number
    },
    model: {
        host: string,
        port: number
    }
};
switch(process.env.NODE_ENV) {
    case 'production':
        config = production
        break;
    case 'development': 
        config = development
        break;
    case 'github': 
        config = github
        break;
    default: 
        config = development
}
export default config
