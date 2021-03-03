const development = {
    database: "mongodb://mongo:27017/DEVwebsiteDB",
    databaseName: "DEVwebsiteDB",
    elastic: 'http://elasticsearch:9200',
    elasticPassword: process.env.ELASTIC_PASSWORD||"changeme",
    host: "website",
    port: 5005,
};

const github = {
    database: "mongodb://mongo:27017/DEVwebsiteDB",
    databaseName: "DEVwebsiteDB",
    elastic: 'http://elasticsearch:9200',
    elasticPassword: process.env.ELASTIC_PASSWORD||"changeme",    
    host: "website",
    port: 5005,
};

const production = {
    database: "mongodb://mongo:27017/websiteDB",
    databaseName: "websiteDB",
    elastic: 'http://elasticsearch:9200',
    elasticPassword: process.env.ELASTIC_PASSWORD||"changeme",
    host: "website",
    port: 5005,
};

let config : {database: string, databaseName : string, elastic: string, elasticPassword: string, host: string, port: number};
switch (process.env.NODE_ENV) {
    case "production":
        config = production;
        break;
    case "development":
        config = development;
        break;
    case "github":
        config = github;
        break;
    default:
        config = development;
}
export default config;
