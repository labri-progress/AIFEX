const config = {
    database: "mongodb://mongo:27017/DEVwebsiteDB",
    databaseName: "DEVwebsiteDB",
    elastic: 'http://elasticsearch:9200',
    elasticPassword: process.env.ELASTIC_PASSWORD||"changeme",
    host: "website",
    port: 80,
};

export default config;
