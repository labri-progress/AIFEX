import * as winston from "winston";

let logLevel;

let transports: any[] = 
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



export const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(winston.format.label({label:'account'}),winston.format.json()),
  transports,
});