const config = {
    database: 'mongodb://mongo:27017/DEVsessionDB',
    elastic: 'http://elasticsearch:9200',
    elasticPassword: process.env.ELASTIC_PASSWORD||"changeme",
    rabbitmq: 'rabbitmq',
    port: 80,
    host: "session",
    website: {
        host: "website",
        port: 80
    },
    model: {
        host: "model",
        port: 80
    }
}
export default config
