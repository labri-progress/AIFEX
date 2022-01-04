import * as winston from "winston";


let logLevel;

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
        logLevel = 'info'
}



export const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(winston.format.label({label:'printer'}),winston.format.json()),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ],
});
  