import {Category,CategoryLogger,CategoryServiceFactory,CategoryConfiguration,LogLevel} from "typescript-logging";
 
// Optionally change default settings, in this example set default logging to Info.
// Without changing configuration, categories will log to Error.

let logLevel;

switch(process.env.NODE_ENV) {
    case 'production':
        logLevel = LogLevel.Error;
        break;
    case 'development': 
        logLevel = LogLevel.Error;
        break;
    case 'github':
        logLevel = LogLevel.Error;
        break;
    default: 
        logLevel = LogLevel.Error
}

CategoryServiceFactory.setDefaultConfiguration(new CategoryConfiguration(logLevel));
 
// Create categories, they will autoregister themselves, one category without parent (root) and a child category.
export const logger = new Category("TabScript");
