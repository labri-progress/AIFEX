const github = {
    database: 'mongodb://mongo:27017/DEVaccountDB',
    elastic: 'http://elasticsearch:9200',
    elasticPassword: process.env.ELASTIC_PASSWORD||"changeme",
    port: 5008,
    host: "account"
}

const development = {
    database: 'mongodb://mongo:27017/DEVaccountDB',
    elastic: 'http://elasticsearch:9200',
    elasticPassword: process.env.ELASTIC_PASSWORD||"changeme",
    port: 5008,
    host: "account"
}

const production = {
    database: 'mongodb://mongo:27017/accountDB',
    elastic: 'http://elasticsearch:9200',
    elasticPassword: process.env.ELASTIC_PASSWORD||"changeme",
    port: 5008,
    host: "account"
}

let config : {database:string, elastic:string, elasticPassword:string, port:number, host:string};
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
