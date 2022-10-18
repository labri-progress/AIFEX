const config = {
    port: 80,
    host: "api",
    elastic: 'http://elasticsearch:9200',
    elasticPassword: process.env.ELASTIC_PASSWORD||"changeme",
    tokenSecret: process.env.TOKEN_SECRET||"changeme",
    website: {
        host: "website",
        port: 80,
        
    },
    session: {
        host: "session",
        port: 80
    },
    model: {
        host: "model",
        port: 80
    },
    account: {
        host: "account",
        port: 80
    },
    evaluator: {
        host: "evaluator",
        port: 80
    },
    generator: {
        host: "generator",
        port: 80
    }
}

export default config 