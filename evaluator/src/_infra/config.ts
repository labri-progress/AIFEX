const config = {
    database: 'mongodb://mongo:27017/DEVobjectiveDB',
    elastic: 'http://elasticsearch:9200',
    elasticPassword: process.env.ELASTIC_PASSWORD||"changeme",
    port: 80,
    host: "evaluator",
}
export default config;
