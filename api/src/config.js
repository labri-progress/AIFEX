const github = {
    port: 5011,
    host: "api",
    website: {
        host: "website",
        port:5005
    },
    session: {
        host: "session",
        port: 5006
    },
    model: {
        host: "model",
        port: 5007
    }
}

const development = {
    port: 5011,
    host: "locahost",
    website: {
        host: "website",
        port:5005
    },
    session: {
        host: "session",
        port: 5006
    },
    model: {
        host: "model",
        port: 5007
    }
}

const production = {
    port: 5011,
    host: "api",
    website: {
        host: "website",
        port:5005
    },
    session: {
        host: "session",
        port: 5006
    },
    model: {
        host: "model",
        port: 5007
    }
}

let config;
switch(process.env.NODE_ENV) {
    case 'production':
        config = production
        break;
    case 'development': 
        config = development
        break;
    case 'github':
        config = github
    default: 
        config = development
}
export default config
