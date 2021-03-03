const development = {
    database: 'mongodb://mongo:27017/DEVobjectiveDB',
    elastic: 'http://elasticsearch:9200',
    elasticPassword: process.env.ELASTIC_PASSWORD||"changeme",
    port: 5010,
    host: "evaluator",
}

const github = {
    database: 'mongodb://mongo:27017/DEVobjectiveDB',
    elastic: 'http://elasticsearch:9200',
    elasticPassword: process.env.ELASTIC_PASSWORD||"changeme",
    port: 5010,
    host: "evaluator",
}


const production = {
    database: 'mongodb://mongo:27017/objectivetDB',
    elastic: 'http://elasticsearch:9200',
    elasticPassword: process.env.ELASTIC_PASSWORD||"changeme",
    port: 5010,
    host: "evaluator",
}

let config: {database: string, elastic: string, elasticPassword: string, port: number, host: string};
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
export default config;
