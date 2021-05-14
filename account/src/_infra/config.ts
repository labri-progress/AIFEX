const config = {
    database: 'mongodb://mongo:27017/DEVaccountDB',
    elastic: 'http://elasticsearch:9200',
    elasticPassword: process.env.ELASTIC_PASSWORD||"changeme",
    port: 80,
    host: "account"
}

export default config 
