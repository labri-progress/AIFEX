import * as winston from "winston";
import { ElasticsearchTransport } from 'winston-elasticsearch';
import config from "./_infra/config";

let logLevel;

let transports: any[] = 
  [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]

if (process.env.NODE_ENV === 'production') {
  transports.push(new ElasticsearchTransport({
    level:'debug',
    clientOpts: {
      node: config.elastic,
        auth: {
          username: 'elastic',
          password: config.elasticPassword
        }
    }
  }));
}


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



new winston.transports.File({ filename: 'error.log', level: 'error' }),
new winston.transports.File({ filename: 'combined.log' })

export const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(winston.format.label({label:'account'}),winston.format.json()),
  transports,
});