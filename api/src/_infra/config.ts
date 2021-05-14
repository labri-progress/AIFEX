const config = {
    port: 80,
    host: "api",
    elastic: 'http://elasticsearch:9200',
    elasticPassword: process.env.ELASTIC_PASSWORD||"changeme",
    website: {
        host: "website",
        port: 80,
        
    },
    session: {
        host: "session",
        port: 80
    },
    account: {
        host: "account",
        port: 80
    }
}

export default config 