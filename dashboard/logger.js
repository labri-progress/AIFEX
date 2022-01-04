const winston = require('winston');

let logLevel;

let transports = 
  [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]


switch(process.env.NODE_ENV) {
    case 'production':
        logLevel = 'info';
        break;
    case 'development': 
        logLevel = 'debug';
        break;
    case 'github':
        logLevel = 'error';
        break;
    default: 
        logLevel = 'warn'
}

const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(winston.format.label({label:'dashboard'}),winston.format.json()),
  transports,
});

module.exports = logger;