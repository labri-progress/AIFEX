
const config = {
    database: 'mongodb://mongo:27017/modelDB',
    elastic: 'http://elasticsearch:9200',
    elasticPassword: process.env.ELASTIC_PASSWORD||"changeme",
    rabbitmq: 'rabbitmq',
    port: 80,
    socketPort: 8080,
    host: "generator",
    session: {
        host: "session",
        port: 80
    }
}

export default config
