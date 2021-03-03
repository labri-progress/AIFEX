const github = {
    website: {
        host: "website",
        port: 5005
    },
    session: {
        host: "session",
        port: 5006
    },
    model: {
        host: "model",
        port: 5007
    },
    account: {
        host: "account",
        port: 5008
    }
}

const development = {
    website: {
        host: "website",
        port: 5005
    },
    session: {
        host: "session",
        port: 5006
    },
    model: {
        host: "model",
        port: 5007
    },
    account: {
        host: "account",
        port: 5008
    }
}

const production = {
    website: {
        host: "website",
        port: 5005
    },
    session: {
        host: "session",
        port: 5006
    },
    model: {
        host: "model",
        port: 5007
    },
    account: {
        host: "account",
        port: 5008
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
