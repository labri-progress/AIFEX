const config = {
    elastic: 'http://elasticsearch:9200',
    elasticPassword: process.env.ELASTIC_PASSWORD||"changeme",
    port: 80,
    host: "printer",
    website: {
        host: "website",
        port: 80
    },
    session: {
        host: "session",
        port: 80
    }
}

export default config;
