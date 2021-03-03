const development = {
    elastic: 'http://elasticsearch:9200',
    elasticPassword: process.env.ELASTIC_PASSWORD||"changeme",
    port: 5009,
    host: "printer",
    website: {
        host: "website",
        port: 5005
    },
    session: {
        host: "session",
        port: 5006
    }
}

const github = {
    elastic: 'http://elasticsearch:9200',
    elasticPassword: process.env.ELASTIC_PASSWORD||"changeme",
    port: 5009,
    host: "printer",
    website: {
        host: "website",
        port: 5005
    },
    session: {
        host: "session",
        port: 5006
    }
}


const production = {
    elastic: 'http://elasticsearch:9200',
    elasticPassword: process.env.ELASTIC_PASSWORD||"changeme",
    port: 5009,
    host: "printer",
    website: {
        host: "website",
        port: 5005
    },
    session: {
        host: "session",
        port: 5006
    }
}

let config : {
    elastic: string,
    elasticPassword: string,
    port: number,
    host: string,
    website: {
        host: string,
        port: number
    },
    session: {
        host: string,
        port: number
    }
};

switch(process.env.NODE_ENV) {
    case 'production':
        config = production
        break;
    case 'development': 
        config = development
        break;
    case 'github': 
        config = github
        break;
    default: 
        config = development
}
export default config;
